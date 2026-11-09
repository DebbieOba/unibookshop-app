import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as argon2 from 'argon2';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/postgres/prisma.service';
import { UploadService } from '../../../integrations/object-storage/upload.service';
import { RedisService } from '../../../database/redis/redis.service';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { UpsertAddressDto } from '../dto/upsert-address.dto';
import { UpdateAddressDto } from '../dto/update-address.dto';
import { UpdateNotificationPreferencesDto } from '../dto/update-notification-preferences.dto';
import { DeleteAccountDto } from '../dto/delete-account.dto';

// Explicit field allowlist for the User relation embedded in every Profile
// response — deliberately NOT `include: { user: true }`, which would also
// serialize passwordHash straight into the HTTP response body.
const SAFE_USER_SELECT = {
  id: true,
  email: true,
  bookshop: { select: { id: true, name: true } },

  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
    private readonly redis: RedisService,
  ) {}

  getProfile(userId: string) {
    return this.prisma.profile.findUniqueOrThrow({
      where: { userId },
      include: {
        user: { select: SAFE_USER_SELECT },
      },
    });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const profileFields = dto;

    return this.prisma.profile.update({
      where: { userId },
      data: profileFields,
      include: {
        user: { select: SAFE_USER_SELECT },
      },
    });
  }

  async uploadAvatar(userId: string, fileBuffer: Buffer) {
    const avatarUrl = await this.uploadService.uploadImage(
      fileBuffer,
      'avatars',
    );
    return this.prisma.profile.update({
      where: { userId },
      data: { avatarUrl },
      include: {
        user: { select: SAFE_USER_SELECT },
      },
    });
  }

  async updateNotificationPreferences(
    userId: string,
    dto: UpdateNotificationPreferencesDto,
  ) {
    const current = await this.prisma.profile.findUniqueOrThrow({
      where: { userId },
    });
    const existing =
      current.notificationPreferences &&
      typeof current.notificationPreferences === 'object'
        ? (current.notificationPreferences as Record<string, boolean>)
        : {};

    // Merge onto the existing JSON value rather than overwriting the whole
    // object — a partial update shouldn't silently reset the other flag.
    return this.prisma.profile.update({
      where: { userId },
      data: { notificationPreferences: { ...existing, ...dto } },
      include: {
        user: { select: SAFE_USER_SELECT },
      },
    });
  }

  listAddresses(userId: string) {
    return this.prisma.address.findMany({ where: { userId } });
  }

  addAddress(userId: string, dto: UpsertAddressDto) {
    return this.prisma.address.create({ data: { ...dto, userId } });
  }

  private async assertOwnsAddress(userId: string, addressId: string) {
    const address = await this.prisma.address.findUnique({
      where: { id: addressId },
    });
    if (!address) throw new NotFoundException('Address not found');
    if (address.userId !== userId) throw new ForbiddenException();
    return address;
  }

  async updateAddress(
    userId: string,
    addressId: string,
    dto: UpdateAddressDto,
  ) {
    await this.assertOwnsAddress(userId, addressId);
    return this.prisma.address.update({ where: { id: addressId }, data: dto });
  }

  async deleteAddress(userId: string, addressId: string) {
    await this.assertOwnsAddress(userId, addressId);
    await this.prisma.address.delete({ where: { id: addressId } });
  }

  async setDefaultAddress(userId: string, addressId: string) {
    await this.assertOwnsAddress(userId, addressId);
    await this.prisma.$transaction([
      this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      }),
      this.prisma.address.update({
        where: { id: addressId },
        data: { isDefault: true },
      }),
    ]);
  }

  setPushToken(userId: string, token: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { pushToken: token },
    });
  }

  /**
   * Data Subject Access Request (DSAR) - Right to Data Portability (NDPA §38 / GDPR Art. 20)
   * Exports all personal records, profile, addresses, and order history in machine-readable JSON.
   */
  async exportUserData(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        profile: true,
        addresses: true,
        orders: {
          select: {
            id: true,
            totalAmount: true,
            status: true,
            createdAt: true,
            items: {
              select: {
                quantity: true,
                unitPrice: true,
                book: { select: { title: true, author: true, isbn: true } },
              },
            },
          },
        },
      },
    });
    return {
      exportedAt: new Date().toISOString(),
      disclaimer: 'Official data export generated pursuant to NDPA 2023 §38.',
      data: user,
    };
  }

  /**
   * Account Deletion & Right to Erasure (NDPA §37 / Apple App Store Guideline 5.1.1(v) / Google Play User Data Policy)
   * Authenticates user ownership via current password, revokes all sessions, cascades profile & addresses,
   * and anonymizes completed orders to comply with CBN/FIRS 7-year statutory financial accounting laws.
   */
  async deleteAccount(userId: string, dto: DeleteAccountDto) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    const isMatch = await argon2.verify(user.passwordHash, dto.password);
    if (!isMatch) {
      throw new UnauthorizedException('Incorrect password. Account deletion aborted.');
    }

    // 1. Invalidate all active Redis refresh tokens & session caches
    try {
      const keys = await this.redis.keys(`refresh:${userId}:*`);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
      await this.redis.del(`cart:${userId}`);
    } catch {
      // Continue even if Redis key removal fails
    }

    // 2. Perform database cascading erasure & order anonymization in transaction
    await this.prisma.$transaction(async (tx) => {
      // Check if user has associated financial orders (Statutory CBN/FIRS 7-year audit retention)
      const orderCount = await tx.order.count({ where: { userId } });

      // Clean personal addresses, favorites, ratings, pre-orders, and notification links
      await tx.order.updateMany({
        where: { userId },
        data: { addressId: null },
      });
      await tx.address.deleteMany({ where: { userId } });
      await tx.favourite.deleteMany({ where: { userId } });
      await tx.rating.deleteMany({ where: { userId } });
      await tx.preOrderReservation.deleteMany({ where: { userId } });
      await tx.notificationRecipient.deleteMany({ where: { userId } });

      if (orderCount > 0) {
        // Anonymize personal profile
        await tx.profile.update({
          where: { userId },
          data: {
            fullName: 'Anonymized Deleted User',
            phone: null,
            avatarUrl: null,
            interests: [],
          },
        });

        // Anonymize user record to prevent any future login or identification
        await tx.user.update({
          where: { id: userId },
          data: {
            email: `deleted-${userId}@anonymized.bookdeck.internal`,
            passwordHash: `ACCOUNT_ERASED_${randomUUID()}`,
            accountState: 'RESTRICTED',
            restrictionReason: 'Account permanently erased by user request under NDPA 2023 DSAR.',
            pushToken: null,
            isEmailVerified: false,
          },
        });
      } else {
        // No orders exist: safe to permanently purge core user identity
        await tx.profile.deleteMany({ where: { userId } });
        await tx.user.delete({
          where: { id: userId },
        });
      }
    });

    return {
      success: true,
      message: 'Your account and personal data have been permanently erased from BOOKDECK.',
    };
  }
}

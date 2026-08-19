import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/postgres/prisma.service';
import { UploadService } from '../../../integrations/object-storage/upload.service';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { UpsertAddressDto } from '../dto/upsert-address.dto';
import { UpdateAddressDto } from '../dto/update-address.dto';
import { UpdateNotificationPreferencesDto } from '../dto/update-notification-preferences.dto';

// Explicit field allowlist for the User relation embedded in every Profile
// response — deliberately NOT `include: { user: true }`, which would also
// serialize passwordHash straight into the HTTP response body.
const SAFE_USER_SELECT = {
  id: true,
  email: true,
  matricNumber: true,
  departmentId: true,
  department: true,
  levelId: true,
  level: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
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
    const { departmentId, levelId, matricNumber, ...profileFields } = dto;

    if (departmentId || levelId || matricNumber !== undefined) {
      const normalizedMatric = matricNumber ? matricNumber.trim().toLowerCase() : matricNumber;
      try {
        await this.prisma.user.update({
          where: { id: userId },
          data: { departmentId, levelId, matricNumber: normalizedMatric },
        });
      } catch (err) {
        // P2002 = unique constraint violation — User.matricNumber is @unique
        // (schema.prisma), so this is the "someone else already has this
        // matric number" case, not a real server error.
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
          throw new ConflictException('This matric number is already registered to another account');
        }
        throw err;
      }
    }

    return this.prisma.profile.update({
      where: { userId },
      data: profileFields,
      include: {
        user: { select: SAFE_USER_SELECT },
      },
    });
  }

  async uploadAvatar(userId: string, fileBuffer: Buffer) {
    const avatarUrl = await this.uploadService.uploadImage(fileBuffer, 'avatars');
    return this.prisma.profile.update({
      where: { userId },
      data: { avatarUrl },
      include: {
        user: { select: SAFE_USER_SELECT },
      },
    });
  }

  async updateNotificationPreferences(userId: string, dto: UpdateNotificationPreferencesDto) {
    const current = await this.prisma.profile.findUniqueOrThrow({ where: { userId } });
    const existing =
      current.notificationPreferences && typeof current.notificationPreferences === 'object'
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
    const address = await this.prisma.address.findUnique({ where: { id: addressId } });
    if (!address) throw new NotFoundException('Address not found');
    if (address.userId !== userId) throw new ForbiddenException();
    return address;
  }

  async updateAddress(userId: string, addressId: string, dto: UpdateAddressDto) {
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
      this.prisma.address.updateMany({ where: { userId }, data: { isDefault: false } }),
      this.prisma.address.update({ where: { id: addressId }, data: { isDefault: true } }),
    ]);
  }

  setPushToken(userId: string, token: string) {
    return this.prisma.user.update({ where: { id: userId }, data: { pushToken: token } });
  }
}

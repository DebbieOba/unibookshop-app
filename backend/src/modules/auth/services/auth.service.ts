import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../../database/postgres/prisma.service';
import { RedisService } from '../../../database/redis/redis.service';
import { EmailService } from '../../../integrations/email/email.service';
import { SisService } from '../../../integrations/sis/sis.service';
import { RegisterDto } from '../dto/register.dto';

const REFRESH_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days, matches JWT_REFRESH_TTL default
const RESET_TTL_SECONDS = 60 * 30; // 30 minutes

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly email: EmailService,
    private readonly sis: SisService,
  ) {}

  async listBookshops() {
    return this.prisma.bookshop.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async register(dto: RegisterDto) {
    const normalizedEmail = dto.email.trim().toLowerCase();
    const normalizedMatric = dto.matricNumber?.trim().toLowerCase();

    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: normalizedEmail },
          ...(normalizedMatric ? [{ matricNumber: normalizedMatric }] : []),
        ],
      },
    });
    if (existing) {
      throw new ConflictException('Email or matric number already registered');
    }

    if (dto.matricNumber && this.sis.isConfigured) {
      try {
        const record = await this.sis.lookupStudent(dto.matricNumber);
        if (!record) {
          throw new BadRequestException(
            'Matric number not found in university records',
          );
        }
      } catch (error) {
        if (error instanceof BadRequestException) throw error;
        // SIS reachable-but-erroring (network/5xx) fails open — we don't want
        // a third-party outage to block every registration. A confirmed
        // "not found" (handled above) is the only case that blocks.
        this.logger.warn(
          `SIS lookup errored for ${dto.matricNumber}, allowing registration to proceed`,
        );
      }
    }

    let bookshopId = dto.bookshopId;
    let userRole =
      dto.role === 'admin' || dto.role === 'student' ? dto.role : 'student';

    if (dto.bookshopName) {
      const slug = dto.bookshopName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-');
      const bookshop = await this.prisma.bookshop.create({
        data: {
          name: dto.bookshopName.trim(),
          slug,
        },
      });
      bookshopId = bookshop.id;
      userRole = 'admin';
    } else if (!bookshopId) {
      const defaultBookshop = await this.prisma.bookshop.findFirst({
        where: { slug: 'futa' },
      });
      if (defaultBookshop) {
        bookshopId = defaultBookshop.id;
      }
    }

    const passwordHash = await argon2.hash(dto.password);
    const user = await this.prisma.user.create({
      data: {
        email: normalizedEmail,
        matricNumber: normalizedMatric,
        passwordHash,
        departmentId: dto.departmentId,
        bookshopId,
        role: userRole as any,
        // Students no longer wait on admin approval — straight to the
        // dashboard after signup. Overrides the schema's PENDING default;
        // AccountState/the approvals infrastructure stays intact (an admin
        // can still flip a user to REJECTED later) but nothing new lands
        // in that queue anymore.
        accountState: 'APPROVED',
        // Signup only collects email/matric + password now — fullName is
        // filled in properly on CompleteProfileScreen right after. Profile
        // .fullName is non-nullable, so this is just a placeholder until then.
        profile: {
          create: { fullName: dto.fullName ?? dto.email.split('@')[0] },
        },
      },
    });
    return { id: user.id, accountState: user.accountState };
  }

  async validateUser(identifier: string, password: string) {
    const normalizedIdentifier = identifier.trim().toLowerCase();
    this.logger.debug(`Login attempt: identifier="${normalizedIdentifier}"`);

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: normalizedIdentifier, mode: 'insensitive' } },
          {
            matricNumber: { equals: normalizedIdentifier, mode: 'insensitive' },
          },
        ],
      },
    });

    if (!user) {
      this.logger.warn(
        `Login failed: no user found for identifier="${normalizedIdentifier}"`,
      );
      return null;
    }

    const valid = await argon2.verify(user.passwordHash, password);
    if (!valid) {
      this.logger.warn(
        `Login failed: password mismatch for user="${user.email}"`,
      );
      return null;
    }

    this.logger.debug(`Login success: user="${user.email}" role=${user.role}`);
    return user;
  }

  /**
   * Issues a token pair regardless of account state — a PENDING/REJECTED
   * user needs a session to poll `GET /auth/me` and see their status update
   * (screen 5's Approval Flow). AccountStateGuard (backend-architecture.md
   * §10.2) still blocks every other endpoint for non-approved accounts;
   * `/auth/me` and `/auth/logout` are the deliberate exceptions.
   */
  async login(user: {
    id: string;
    email: string;
    role: string;
    accountState: string;
  }) {
    return this.issueTokenPair(user.id, user.email, user.role);
  }

  async refresh(refreshToken: string) {
    let payload: { sub: string; jti: string };
    try {
      payload = this.jwt.verify(refreshToken, {
        secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const stored = await this.redis.get(
      `refresh:${payload.sub}:${payload.jti}`,
    );
    if (!stored) {
      throw new UnauthorizedException('Refresh token revoked or expired');
    }
    await this.redis.del(`refresh:${payload.sub}:${payload.jti}`);

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: payload.sub },
    });
    return this.issueTokenPair(user.id, user.email, user.role);
  }

  async logout(userId: string) {
    const keys = await this.redis.keys(`refresh:${userId}:*`);
    if (keys.length) await this.redis.del(...keys);
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return; // don't leak account existence

    const token = randomUUID();
    await this.redis.set(
      `password-reset:${token}`,
      user.id,
      'EX',
      RESET_TTL_SECONDS,
    );
    await this.email.send({
      to: user.email,
      templateId: 'password-reset',
      data: { token },
    });
  }

  async resetPassword(token: string, newPassword: string) {
    const userId = await this.redis.get(`password-reset:${token}`);
    if (!userId) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }
    const passwordHash = await argon2.hash(newPassword);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
    await this.redis.del(`password-reset:${token}`);
    await this.logout(userId); // revoke every existing refresh token
  }

  /** Authenticated change-password (Settings, screen 16) — distinct from the
   * forgot/reset flow above, which doesn't require knowing the old password. */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    const valid = await argon2.verify(user.passwordHash, currentPassword);
    if (!valid) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    const passwordHash = await argon2.hash(newPassword);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
    await this.logout(userId); // revoke every existing refresh token except this request
  }

  private async issueTokenPair(userId: string, email: string, role: string) {
    const accessToken = this.jwt.sign(
      { sub: userId, email, role },
      {
        secret: this.config.getOrThrow('JWT_ACCESS_SECRET'),
        expiresIn: this.config.get('JWT_ACCESS_TTL', '15m'),
      },
    );

    const jti = randomUUID();
    const refreshToken = this.jwt.sign(
      { sub: userId, jti },
      {
        secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_TTL', '30d'),
      },
    );
    await this.redis.set(
      `refresh:${userId}:${jti}`,
      '1',
      'EX',
      REFRESH_TTL_SECONDS,
    );

    return { accessToken, refreshToken };
  }
}

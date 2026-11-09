import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { randomUUID, randomInt } from 'crypto';
import { PrismaService } from '../../../database/postgres/prisma.service';
import { RedisService } from '../../../database/redis/redis.service';
import { EmailService } from '../../../integrations/email/email.service';
import { RegisterDto } from '../dto/register.dto';

const REFRESH_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days, matches JWT_REFRESH_TTL default
const RESET_TTL_SECONDS = 60 * 30; // 30 minutes
const OTP_TTL_SECONDS = 60 * 10; // 10 minutes

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly email: EmailService,
  ) {}

  async listBookshops() {
    return this.prisma.bookshop.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async register(dto: RegisterDto) {
    const normalizedEmail = dto.email.trim().toLowerCase();

    const existing = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    let bookshopId = dto.bookshopId;
    let userRole: 'customer' | 'seller' =
      dto.role === 'seller' ? 'seller' : 'customer';

    if (dto.bookshopName) {
      const slug = dto.bookshopName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-');

      const existingBookshop = await this.prisma.bookshop.findUnique({
        where: { slug },
      });
      if (existingBookshop) {
        throw new ConflictException(
          'A bookstore with this name already exists',
        );
      }
    }

    const passwordHash = await argon2.hash(dto.password);
    
    // Save registration payload temporarily in Redis instead of database
    const payload = JSON.stringify({
      email: normalizedEmail,
      passwordHash,
      bookshopId: dto.bookshopId,
      bookshopName: dto.bookshopName,
      role: dto.role,
      firstName: dto.firstName,
      lastName: dto.lastName,
      fullName: dto.fullName,
    });
    
    await this.redis.set(`pending-user:${normalizedEmail}`, payload, 'EX', 900); // 15 mins

    // Return dummy values since the user is not yet created in the DB
    return { id: 'pending', accountState: 'PENDING', isEmailVerified: false };
  }

  async validateUser(identifier: string, password: string) {
    const normalizedIdentifier = identifier.trim().toLowerCase();
    this.logger.debug(`Login attempt: identifier="${normalizedIdentifier}"`);

    const user = await this.prisma.user.findFirst({
      where: {
        email: { equals: normalizedIdentifier, mode: 'insensitive' },
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
    isEmailVerified: boolean;
  }) {
    if (!user.isEmailVerified) {
      throw new ForbiddenException(
        'Please verify your email address before logging in. Check your inbox for the verification code.',
      );
    }
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

  /** Send a 6-digit OTP to the given email for sign-in or email verification. */
  async sendOtp(email: string, purpose: 'verify-email' | 'sign-in') {
    const normalizedEmail = email.trim().toLowerCase();
    // For sign-in OTP: user must already exist (but we don't reveal that)
    // Generate cryptographically secure 6-digit OTP
    const code = randomInt(100000, 1000000).toString();
    await this.redis.set(
      `otp:${purpose}:${normalizedEmail}`,
      code,
      'EX',
      OTP_TTL_SECONDS,
    );
    await this.email.send({
      to: normalizedEmail,
      templateId: 'otp',
      data: { code, purpose },
    });
  }

  /** Verify the OTP and — for sign-in — exchange it for tokens. */
  async verifyOtp(
    email: string,
    code: string,
    purpose: 'verify-email' | 'sign-in',
  ) {
    const normalizedEmail = email.trim().toLowerCase();
    const key = `otp:${purpose}:${normalizedEmail}`;
    const stored = await this.redis.get(key);

    if (!stored || stored !== code) {
      throw new UnauthorizedException('Invalid or expired verification code');
    }

    // Consume the OTP — single use
    await this.redis.del(key);

    if (purpose === 'sign-in') {
      const user = await this.prisma.user.findUnique({
        where: { email: normalizedEmail },
      });
      if (!user) throw new UnauthorizedException('Account not found');
      return this.issueTokenPair(user.id, user.email, user.role);
    }

    // For verify-email: check pending registration payload
    const pendingData = await this.redis.get(`pending-user:${normalizedEmail}`);
    if (pendingData) {
      const dto = JSON.parse(pendingData);
      
      let bookshopId = dto.bookshopId;
      let userRole: 'customer' | 'seller' = dto.role === 'seller' ? 'seller' : 'customer';

      if (dto.bookshopName) {
        const slug = dto.bookshopName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const bookshop = await this.prisma.bookshop.create({
          data: { name: dto.bookshopName.trim(), slug },
        });
        bookshopId = bookshop.id;
        userRole = 'seller';
      }

      await this.prisma.user.create({
        data: {
          email: normalizedEmail,
          passwordHash: dto.passwordHash,
          bookshopId,
          role: userRole as any,
          accountState: 'APPROVED',
          isEmailVerified: true, // immediately verified
          profile: {
            create: {
              fullName: dto.firstName && dto.lastName ? `${dto.firstName} ${dto.lastName}` : dto.fullName ?? dto.email.split('@')[0],
            },
          },
        },
      });
      
      await this.redis.del(`pending-user:${normalizedEmail}`);
      return { verified: true };
    }

    // Fallback: If not found in pending, maybe they were already created previously?
    const existingUser = await this.prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      await this.prisma.user.update({
        where: { email: normalizedEmail },
        data: { isEmailVerified: true },
      });
      return { verified: true };
    }
    
    throw new BadRequestException('Registration expired or not found. Please sign up again.');

    return { verified: true };
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

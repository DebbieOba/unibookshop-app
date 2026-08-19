import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/postgres/prisma.service';
import { NotifyService } from '../../notification/notification.public-api';

@Injectable()
export class ApprovalsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notify: NotifyService,
  ) {}

  findPending() {
    return this.prisma.user.findMany({
      where: { accountState: 'PENDING' },
      include: { profile: true, department: true },
    });
  }

  /** Approved and restricted users — the "Active" side of Users & Access. */
  findActive() {
    return this.prisma.user.findMany({
      where: { accountState: { in: ['APPROVED', 'RESTRICTED'] } },
      include: { profile: true, department: true },
    });
  }

  async decide(userId: string, decision: 'APPROVED' | 'REJECTED') {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { accountState: decision },
    });

    await this.notify.notifyUser(updated, {
      type: 'APPROVAL',
      // APPROVAL covers both outcomes — emailTemplateId disambiguates which
      // copy EmailChannel sends (see notify-channel.interface.ts).
      emailTemplateId: decision === 'APPROVED' ? 'account-approved' : 'account-rejected',
      title: decision === 'APPROVED' ? 'Account approved' : 'Account rejected',
      body:
        decision === 'APPROVED'
          ? 'Your account has been approved — welcome to the bookshop!'
          : 'Your account application was rejected. Contact admin for details.',
    });

    return updated;
  }

  /**
   * Full-account lock for an already-approved user — reuses AccountStateGuard's
   * existing `!== 'APPROVED'` check, exactly like PENDING/REJECTED are blocked
   * today, so no guard code changes are needed for this to take effect.
   */
  async restrict(userId: string, reason: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.accountState !== 'APPROVED') {
      throw new BadRequestException('Only an approved user can be restricted');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { accountState: 'RESTRICTED', restrictionReason: reason },
    });

    await this.notify.notifyUser(updated, {
      type: 'APPROVAL',
      emailTemplateId: 'account-restricted',
      title: 'Account restricted',
      body: `Your account has been restricted. Reason: ${reason}`,
    });

    return updated;
  }

  async restore(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.accountState !== 'RESTRICTED') {
      throw new BadRequestException('Only a restricted user can be restored');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { accountState: 'APPROVED', restrictionReason: null },
    });

    await this.notify.notifyUser(updated, {
      type: 'APPROVAL',
      emailTemplateId: 'account-restored',
      title: 'Account restored',
      body: 'Your account access has been restored.',
    });

    return updated;
  }
}

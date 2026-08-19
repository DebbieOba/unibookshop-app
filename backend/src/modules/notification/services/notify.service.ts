import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/postgres/prisma.service';
import { InAppChannel } from '../channels/in-app.channel';
import { PushChannel } from '../channels/push.channel';
import { EmailChannel } from '../channels/email.channel';
import {
  NotificationPayload,
  NotifyUser,
} from '../channels/notify-channel.interface';

@Injectable()
export class NotifyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inApp: InAppChannel,
    private readonly push: PushChannel,
    private readonly email: EmailChannel,
  ) {}

  /** InAppChannel always runs; Push/Email are best-effort fan-out on top of it. */
  async notifyUser(
    user: NotifyUser,
    notification: NotificationPayload,
  ): Promise<void> {
    await this.inApp.send(user, notification);
    await Promise.allSettled([
      this.push.send(user, notification),
      this.email.send(user, notification),
    ]);
  }

  async broadcast(
    notification: NotificationPayload,
    audience: 'student' | 'admin' | 'all' = 'student',
  ) {
    const where = audience === 'all' ? {} : { role: audience };
    const users = await this.prisma.user.findMany({
      where: { ...where, accountState: 'APPROVED' },
      select: { id: true, email: true },
    });
    await Promise.allSettled(
      users.map((u) => this.notifyUser(u, notification)),
    );
  }
}

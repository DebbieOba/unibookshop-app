import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/postgres/prisma.service';
import { NotificationPayload, NotifyChannel, NotifyUser } from './notify-channel.interface';

/** Always runs — the only channel that's a source of truth (backend-architecture.md §12). */
@Injectable()
export class InAppChannel implements NotifyChannel {
  constructor(private readonly prisma: PrismaService) {}

  async send(user: NotifyUser, notification: NotificationPayload): Promise<void> {
    await this.prisma.notification.create({
      data: {
        type: notification.type,
        title: notification.title,
        body: notification.body,
        recipients: { create: { userId: user.id } },
      },
    });
  }
}

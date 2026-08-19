import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/postgres/prisma.service';
import { FcmService } from '../../../integrations/fcm/fcm.service';
import {
  NotificationPayload,
  NotifyChannel,
  NotifyUser,
} from './notify-channel.interface';

@Injectable()
export class PushChannel implements NotifyChannel {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fcm: FcmService,
  ) {}

  async send(
    user: NotifyUser,
    notification: NotificationPayload,
  ): Promise<void> {
    const record = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { pushToken: true },
    });
    if (!record?.pushToken) return;
    await this.fcm.sendToDevice(
      record.pushToken,
      notification.title,
      notification.body,
      notification.data,
    );
  }
}

import { Injectable } from '@nestjs/common';
import { EmailService } from '../../../integrations/email/email.service';
import { NotificationPayload, NotifyChannel, NotifyUser } from './notify-channel.interface';

const TEMPLATE_BY_TYPE: Record<NotificationPayload['type'], 'account-approved' | 'account-rejected' | 'order-receipt' | null> = {
  APPROVAL: 'account-approved',
  ORDER_UPDATE: 'order-receipt',
  BROADCAST: null,
  NEW_ARRIVAL: null,
};

/** Backup channel for approvals/rejections and order updates — backend-architecture.md §12. */
@Injectable()
export class EmailChannel implements NotifyChannel {
  constructor(private readonly email: EmailService) {}

  async send(user: NotifyUser, notification: NotificationPayload): Promise<void> {
    const templateId = notification.emailTemplateId ?? TEMPLATE_BY_TYPE[notification.type];
    if (!templateId) return; // broadcast/new-arrival stay in-app + push only
    await this.email.send({
      to: user.email,
      templateId,
      data: { title: notification.title, body: notification.body },
    });
  }
}

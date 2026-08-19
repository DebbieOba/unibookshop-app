import { Module } from '@nestjs/common';
import { FcmModule } from '../../integrations/fcm/fcm.module';
import { EmailModule } from '../../integrations/email/email.module';
import { NotificationsController } from './controllers/notifications.controller';
import { NotifyService } from './services/notify.service';
import { InAppChannel } from './channels/in-app.channel';
import { PushChannel } from './channels/push.channel';
import { EmailChannel } from './channels/email.channel';

@Module({
  imports: [FcmModule, EmailModule],
  controllers: [NotificationsController],
  providers: [NotifyService, InAppChannel, PushChannel, EmailChannel],
  exports: [NotifyService],
})
export class NotificationModule {}

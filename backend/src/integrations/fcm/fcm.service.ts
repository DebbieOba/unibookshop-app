import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { cert, initializeApp, type App } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

@Injectable()
export class FcmService implements OnModuleInit {
  private app?: App;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const projectId = this.config.get<string>('FCM_PROJECT_ID');
    const clientEmail = this.config.get<string>('FCM_CLIENT_EMAIL');
    const privateKey = this.config.get<string>('FCM_PRIVATE_KEY');

    if (!projectId || !clientEmail || !privateKey) {
      // Not configured yet — fine during local scaffolding/dev.
      return;
    }

    this.app = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });
  }

  async sendToDevice(
    deviceToken: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ) {
    if (!this.app) return;
    await getMessaging(this.app).send({
      token: deviceToken,
      notification: { title, body },
      // Lets the frontend build a deep link on tap (frontend-architecture.md
      // §10) — e.g. { orderId } to open that order instead of just the feed.
      data,
    });
  }
}

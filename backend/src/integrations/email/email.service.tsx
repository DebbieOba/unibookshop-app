import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { render } from '@react-email/render';
import { PasswordResetEmail } from './templates/PasswordResetEmail';
import { AccountApprovedEmail } from './templates/AccountApprovedEmail';
import { AccountRejectedEmail } from './templates/AccountRejectedEmail';
import { AccountRestrictedEmail } from './templates/AccountRestrictedEmail';
import { AccountRestoredEmail } from './templates/AccountRestoredEmail';
import { OrderReceiptEmail } from './templates/OrderReceiptEmail';
import { OtpEmail } from './templates/OtpEmail';

export type EmailTemplateId =
  | 'password-reset'
  | 'account-approved'
  | 'account-rejected'
  | 'account-restricted'
  | 'account-restored'
  | 'order-receipt'
  | 'otp';

export interface SendEmailInput {
  to: string;
  templateId: EmailTemplateId;
  data: Record<string, unknown>;
}

const SUBJECT_BY_TEMPLATE: Record<EmailTemplateId, string> = {
  'password-reset': 'Reset your password',
  'account-approved': "You're in! Your account was approved",
  'account-rejected': 'Update on your account application',
  'account-restricted': 'Your account has been restricted',
  'account-restored': 'Your account access has been restored',
  'order-receipt': 'Your order update',
  otp: 'Your verification code',
};

function renderTemplate(
  templateId: EmailTemplateId,
  data: Record<string, unknown>,
) {
  switch (templateId) {
    case 'password-reset':
      return <PasswordResetEmail token={data.token as string} />;
    case 'account-approved':
      return <AccountApprovedEmail />;
    case 'account-rejected':
      return <AccountRejectedEmail />;
    case 'account-restricted':
      return <AccountRestrictedEmail body={data.body as string} />;
    case 'account-restored':
      return <AccountRestoredEmail />;
    case 'order-receipt':
      return (
        <OrderReceiptEmail
          title={data.title as string}
          body={data.body as string}
        />
      );
    case 'otp':
      return (
        <OtpEmail
          code={data.code as string}
          purpose={(data.purpose as 'verify-email' | 'sign-in') ?? 'sign-in'}
        />
      );
  }
}

/**
 * Gmail-powered email service using Nodemailer.
 *
 * Required .env variables:
 *   GMAIL_USER       — your Gmail address (e.g. yourname@gmail.com)
 *   GMAIL_APP_PASSWORD — a Google App Password (NOT your normal password)
 *
 * To generate a Google App Password:
 *   1. Go to https://myaccount.google.com/apppasswords
 *   2. Select "Mail" and your device
 *   3. Copy the 16-character password Google generates
 *   4. Paste it into GMAIL_APP_PASSWORD in your .env file
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter?: nodemailer.Transporter;
  private from: string = '';
  private isTestAccount = false;

  constructor(config: ConfigService) {
    const gmailUser = config.get<string>('GMAIL_USER');
    const gmailAppPassword = config.get<string>('GMAIL_APP_PASSWORD');

    if (gmailUser && gmailAppPassword && gmailUser !== 'your-gmail@gmail.com') {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailAppPassword,
        },
      });
      this.from = `BOOKDECK <${gmailUser}>`;
      this.logger.log(`Email service initialized with Gmail (${gmailUser})`);
    } else {
      // Fallback to Ethereal Email for testing if Gmail is not configured
      this.logger.log('Gmail not configured. Creating Ethereal test account...');
      this.initTestAccount();
    }
  }

  private async initTestAccount() {
    try {
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: testAccount.user, // generated ethereal user
          pass: testAccount.pass, // generated ethereal password
        },
      });
      this.from = '"Test Bookstore" <test@example.com>';
      this.isTestAccount = true;
      this.logger.log('Ethereal test account ready.');
    } catch (err) {
      this.logger.error('Failed to create Ethereal test account:', err);
    }
  }

  async send({ to, templateId, data }: SendEmailInput): Promise<void> {
    if (!this.transporter) {
      this.logger.warn(`Transporter not ready — skipping email to ${to}`);
      return;
    }

    const html = await render(renderTemplate(templateId, data));

    try {
      const info = await this.transporter.sendMail({
        from: this.from,
        to,
        subject: SUBJECT_BY_TEMPLATE[templateId],
        html,
      });

      this.logger.log(
        `Email "${templateId}" sent to ${to} — messageId: ${info.messageId}`,
      );

      // If using Ethereal, print the URL where the user can view the email in their browser!
      if (this.isTestAccount) {
        this.logger.log(`📧 [TEST EMAIL] View it here: ${nodemailer.getTestMessageUrl(info)}`);
      }
    } catch (error: any) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
      throw new Error(`Email sending failed: ${error.message}`);
    }
  }
}

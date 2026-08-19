import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import { PasswordResetEmail } from './templates/PasswordResetEmail';
import { AccountApprovedEmail } from './templates/AccountApprovedEmail';
import { AccountRejectedEmail } from './templates/AccountRejectedEmail';
import { AccountRestrictedEmail } from './templates/AccountRestrictedEmail';
import { AccountRestoredEmail } from './templates/AccountRestoredEmail';
import { OrderReceiptEmail } from './templates/OrderReceiptEmail';

export type EmailTemplateId =
  | 'password-reset'
  | 'account-approved'
  | 'account-rejected'
  | 'account-restricted'
  | 'account-restored'
  | 'order-receipt';

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
  }
}

/** Wraps the Resend SDK — see backend-architecture.md §12. */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend?: Resend;
  private readonly from = 'CURRICULA <no-reply@curricula.app>';

  constructor(config: ConfigService) {
    const apiKey = config.get<string>('RESEND_API_KEY');
    // Resend's constructor throws on an empty key, so only build it once
    // configured — same "tolerate missing config until used" pattern as
    // FcmService/UploadService, for local scaffolding/dev.
    if (apiKey) {
      this.resend = new Resend(apiKey);
    }
  }

  async send({ to, templateId, data }: SendEmailInput): Promise<void> {
    if (!this.resend) {
      this.logger.warn(
        `RESEND_API_KEY not set — skipping "${templateId}" email to ${to}`,
      );
      return;
    }

    const html = await render(renderTemplate(templateId, data));
    await this.resend.emails.send({
      from: this.from,
      to,
      subject: SUBJECT_BY_TEMPLATE[templateId],
      html,
    });
  }
}

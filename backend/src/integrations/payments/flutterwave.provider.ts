import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { timingSafeEqual } from 'crypto';
import {
  PaymentEvent,
  PaymentInitResult,
  PaymentOrderInput,
  PaymentProvider,
  PaymentStatus,
} from './payment-provider.interface';

@Injectable()
export class FlutterwaveProvider implements PaymentProvider {
  private readonly secretKey: string;
  private readonly webhookSecretHash: string;
  private readonly baseUrl = 'https://api.flutterwave.com/v3';

  constructor(config: ConfigService) {
    this.secretKey = config.get<string>('FLUTTERWAVE_SECRET_KEY', '');
    this.webhookSecretHash = config.get<string>(
      'FLUTTERWAVE_WEBHOOK_SECRET_HASH',
      '',
    );
  }

  async initialize(order: PaymentOrderInput): Promise<PaymentInitResult> {
    const response = await axios.post(
      `${this.baseUrl}/payments`,
      {
        tx_ref: order.id,
        amount: order.totalAmount,
        currency: 'NGN',
        customer: { email: order.userEmail },
        // Without this, Flutterwave redirects to whatever default/no URL is
        // set on the dashboard, which never matches the app's deep-link
        // scheme — the WebView in CheckoutScreen.tsx would never detect completion.
        redirect_url: 'bookdeck://payment-callback',
      },
      { headers: { Authorization: `Bearer ${this.secretKey}` } },
    );
    return {
      redirectUrl: response.data.data.link,
      reference: order.id,
    };
  }

  async verify(reference: string): Promise<PaymentStatus> {
    const response = await axios.get(
      `${this.baseUrl}/transactions/verify_by_reference?tx_ref=${reference}`,
      { headers: { Authorization: `Bearer ${this.secretKey}` } },
    );
    return response.data.data.status === 'successful' ? 'SUCCESSFUL' : 'FAILED';
  }

  /**
   * Flutterwave doesn't HMAC-sign the body — it just echoes back the exact
   * "Secret Hash" configured in the dashboard via the `verif-hash` header, so
   * verification is a direct (constant-time) string comparison, not a
   * signature computation. See backend-architecture.md §10.3/§12.
   */
  async handleWebhook(
    rawBody: Buffer,
    signature: string,
  ): Promise<PaymentEvent> {
    const expectedBuf = Buffer.from(this.webhookSecretHash, 'utf8');
    const signatureBuf = Buffer.from(signature ?? '', 'utf8');
    if (
      !this.webhookSecretHash ||
      expectedBuf.length !== signatureBuf.length ||
      !timingSafeEqual(expectedBuf, signatureBuf)
    ) {
      throw new UnauthorizedException('Invalid Flutterwave webhook signature');
    }

    const payload = JSON.parse(rawBody.toString('utf8'));
    return {
      reference: payload?.data?.tx_ref,
      status: payload?.data?.status === 'successful' ? 'SUCCESSFUL' : 'FAILED',
      amount: payload?.data?.amount ? Number(payload.data.amount) : undefined,
    };
  }
}

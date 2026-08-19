import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { createHmac, timingSafeEqual } from 'crypto';
import {
  PaymentEvent,
  PaymentInitResult,
  PaymentOrderInput,
  PaymentProvider,
  PaymentStatus,
} from './payment-provider.interface';

@Injectable()
export class PaystackProvider implements PaymentProvider {
  private readonly secretKey: string;
  private readonly baseUrl = 'https://api.paystack.co';

  constructor(config: ConfigService) {
    this.secretKey = config.get<string>('PAYSTACK_SECRET_KEY', '');
  }

  async initialize(order: PaymentOrderInput): Promise<PaymentInitResult> {
    const response = await axios.post(
      `${this.baseUrl}/transaction/initialize`,
      {
        email: order.userEmail,
        amount: Math.round(order.totalAmount * 100),
        reference: order.id,
        // Without this, Paystack redirects to whatever default/no URL is set
        // on the dashboard, which never matches the app's deep-link scheme —
        // the WebView in CheckoutScreen.tsx would never detect completion.
        callback_url: 'curricula://payment-callback',
      },
      { headers: { Authorization: `Bearer ${this.secretKey}` } },
    );
    return {
      redirectUrl: response.data.data.authorization_url,
      reference: response.data.data.reference,
    };
  }

  async verify(reference: string): Promise<PaymentStatus> {
    const response = await axios.get(
      `${this.baseUrl}/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${this.secretKey}` } },
    );
    return response.data.data.status === 'success' ? 'SUCCESSFUL' : 'FAILED';
  }

  /**
   * Paystack signs the raw request body with HMAC-SHA512 using the account's
   * secret key — see backend-architecture.md §10.3. An unsigned or
   * mis-signed webhook is rejected before its payload is ever trusted.
   */
  async handleWebhook(rawBody: Buffer, signature: string): Promise<PaymentEvent> {
    const expected = createHmac('sha512', this.secretKey).update(rawBody).digest('hex');

    const expectedBuf = Buffer.from(expected, 'utf8');
    const signatureBuf = Buffer.from(signature ?? '', 'utf8');
    if (expectedBuf.length !== signatureBuf.length || !timingSafeEqual(expectedBuf, signatureBuf)) {
      throw new UnauthorizedException('Invalid Paystack webhook signature');
    }

    const payload = JSON.parse(rawBody.toString('utf8'));
    return {
      reference: payload?.data?.reference,
      status: payload?.data?.status === 'success' ? 'SUCCESSFUL' : 'FAILED',
    };
  }
}

import { Controller, Headers, Inject, Post, Req, type RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { ApiExcludeController } from '@nestjs/swagger';
import { Public } from '../../../common/decorators/public.decorator';
import {
  FLUTTERWAVE_PROVIDER,
  PAYSTACK_PROVIDER,
  type PaymentProvider,
} from '../../../integrations/payments/payment-provider.interface';
import { CheckoutService } from '../services/checkout.service';

// Excluded from Swagger — these are provider-to-server webhooks, not
// endpoints a person or app client would ever call from the docs UI.
@ApiExcludeController()
@Controller('payments')
export class PaymentsWebhookController {
  constructor(
    @Inject(PAYSTACK_PROVIDER) private readonly paystack: PaymentProvider,
    @Inject(FLUTTERWAVE_PROVIDER) private readonly flutterwave: PaymentProvider,
    private readonly checkoutService: CheckoutService,
  ) {}

  @Public()
  @Post('paystack/webhook')
  async paystackWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-paystack-signature') signature: string,
  ) {
    const event = await this.paystack.handleWebhook(req.rawBody!, signature);
    await this.checkoutService.handlePaymentEvent(event.reference, event.status);
    return { received: true };
  }

  @Public()
  @Post('flutterwave/webhook')
  async flutterwaveWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('verif-hash') signature: string,
  ) {
    const event = await this.flutterwave.handleWebhook(req.rawBody!, signature);
    await this.checkoutService.handlePaymentEvent(event.reference, event.status);
    return { received: true };
  }
}

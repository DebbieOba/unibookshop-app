import { Module } from '@nestjs/common';
import { PaystackProvider } from './paystack.provider';
import { FlutterwaveProvider } from './flutterwave.provider';
import {
  PAYSTACK_PROVIDER,
  FLUTTERWAVE_PROVIDER,
} from './payment-provider.interface';

@Module({
  providers: [
    PaystackProvider,
    FlutterwaveProvider,
    { provide: PAYSTACK_PROVIDER, useExisting: PaystackProvider },
    { provide: FLUTTERWAVE_PROVIDER, useExisting: FlutterwaveProvider },
  ],
  exports: [PAYSTACK_PROVIDER, FLUTTERWAVE_PROVIDER],
})
export class PaymentsModule {}

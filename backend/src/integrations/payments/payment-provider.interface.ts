export interface PaymentInitResult {
  redirectUrl: string;
  reference: string;
}

export type PaymentStatus = 'PENDING' | 'SUCCESSFUL' | 'FAILED';

export interface PaymentEvent {
  reference: string;
  status: PaymentStatus;
}

export interface PaymentOrderInput {
  id: string;
  totalAmount: number;
  userEmail: string;
}

/**
 * See backend-architecture.md §11 — Paystack and Flutterwave both implement
 * this so OrderModule never talks to either SDK directly.
 */
export interface PaymentProvider {
  initialize(order: PaymentOrderInput): Promise<PaymentInitResult>;
  verify(reference: string): Promise<PaymentStatus>;
  /**
   * `rawBody` must be the exact, unparsed request bytes — signature
   * verification (backend-architecture.md §10.3) has to run over the raw
   * payload, since re-serializing a parsed JSON object isn't guaranteed to
   * byte-match what the provider actually signed.
   */
  handleWebhook(rawBody: Buffer, signature: string): Promise<PaymentEvent>;
}

export const PAYSTACK_PROVIDER = 'PAYSTACK_PROVIDER';
export const FLUTTERWAVE_PROVIDER = 'FLUTTERWAVE_PROVIDER';

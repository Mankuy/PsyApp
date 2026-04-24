import { Injectable } from '@nestjs/common';

export interface CreatePaymentIntentDto {
  amount: number;
  currency: string;
  customerId?: string;
  metadata?: Record<string, string>;
}

export interface PaymentIntentResult {
  id: string;
  clientSecret: string;
  status: string;
}

@Injectable()
export class StripeService {
  async createPaymentIntent(
    dto: CreatePaymentIntentDto,
  ): Promise<PaymentIntentResult> {
    // TODO: integrate Stripe SDK
    throw new Error('Not implemented');
  }

  async confirmPayment(intentId: string): Promise<PaymentIntentResult> {
    // TODO: integrate Stripe SDK
    throw new Error('Not implemented');
  }
}

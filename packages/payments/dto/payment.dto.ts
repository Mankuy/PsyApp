export class CreatePaymentDto {
  amount: number;
  currency: string;
  description?: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
}

export class PaymentResponseDto {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'canceled';
  createdAt: Date;
}

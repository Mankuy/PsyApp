import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { MercadoPagoService } from './mercadopago.service';
import { StripeService } from './stripe.service';

@Module({
  controllers: [PaymentsController],
  providers: [MercadoPagoService, StripeService],
})
export class PaymentsModule {}

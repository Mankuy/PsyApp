import { Controller, Post, Body, UseGuards, Headers, Get } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { MercadoPagoService } from './mercadopago.service';
import { StripeService } from './stripe.service';

const COUNTRY_CONFIG = {
  UY: { currency: 'UYU', mpPrice: 1490, stripePrice: 1490, name: 'Uruguay' },
  AR: { currency: 'ARS', mpPrice: 29900, stripePrice: 29900, name: 'Argentina' },
  CL: { currency: 'CLP', mpPrice: 24900, stripePrice: 24900, name: 'Chile' },
  MX: { currency: 'MXN', mpPrice: 490, stripePrice: 490, name: 'México' },
  CO: { currency: 'COP', mpPrice: 89000, stripePrice: 89000, name: 'Colombia' },
  PE: { currency: 'PEN', mpPrice: 49, stripePrice: 49, name: 'Perú' },
  BR: { currency: 'BRL', mpPrice: 79, stripePrice: 79, name: 'Brasil' },
};

class CreatePaymentDto {
  plan: 'pro' | 'enterprise';
  provider: 'mercadopago' | 'stripe';
  country: string;
}

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly mpService: MercadoPagoService,
    private readonly stripeService: StripeService,
  ) {}

  @Get('countries')
  async countries() {
    return {
      success: true,
      data: Object.entries(COUNTRY_CONFIG).map(([code, cfg]) => ({
        code,
        name: cfg.name,
        currency: cfg.currency,
      })),
    };
  }

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async create(
    @CurrentUser() user: { sub: string; email: string },
    @Body() dto: CreatePaymentDto,
  ) {
    const country = dto.country?.toUpperCase() || 'UY';
    const config = COUNTRY_CONFIG[country] || COUNTRY_CONFIG['UY'];

    const isPro = dto.plan === 'pro';
    if (!isPro) {
      return { success: true, contact: true, message: 'Nos pondremos en contacto' };
    }

    const price = dto.provider === 'stripe' ? config.stripePrice : config.mpPrice;
    const title = `PsyApp Pro — ${config.name}`;

    if (dto.provider === 'stripe') {
      const session = await this.stripeService.createCheckoutSession({
        psychologistId: user.sub,
        email: user.email,
        plan: dto.plan,
        price,
        title,
        currency: config.currency,
      });
      return { success: true, provider: 'stripe', session };
    }

    const preference = await this.mpService.createPreference({
      psychologistId: user.sub,
      email: user.email,
      plan: dto.plan,
      price,
      title,
    });

    return { success: true, provider: 'mercadopago', preference };
  }

  @Post('webhook')
  async webhook(@Body() body: any, @Headers('stripe-signature') stripeSig?: string) {
    if (stripeSig && this.stripeService['stripe']) {
      // Procesar webhook de Stripe
      const event = this.stripeService['stripe'].webhooks.constructEvent(
        body,
        stripeSig,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
      console.log('[Stripe Webhook]', event.type);
    } else {
      console.log('[MP Webhook]', JSON.stringify(body));
    }
    return { received: true };
  }
}

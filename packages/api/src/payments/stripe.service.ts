import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class StripeService {
  private stripe: any;

  constructor() {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (apiKey && !apiKey.includes('dummy')) {
      try {
        const Stripe = require('stripe');
        this.stripe = new Stripe(apiKey, { apiVersion: '2024-12-18.acacia' });
      } catch {
        console.warn('[Stripe] No se pudo inicializar el cliente Stripe.');
      }
    } else {
      console.warn('[Stripe] STRIPE_SECRET_KEY no configurado. Modo desarrollo.');
    }
  }

  get isMock() {
    return !this.stripe;
  }

  async createCheckoutSession(params: {
    psychologistId: string;
    email: string;
    plan: 'pro' | 'enterprise';
    price: number;
    title: string;
    currency: string;
  }) {
    if (this.isMock) {
      return {
        id: `mock_cs_${Date.now()}`,
        url: `http://localhost:5173/payment/mock?provider=stripe&plan=${params.plan}&price=${params.price}`,
        mock: true,
      };
    }

    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: params.currency.toLowerCase(),
              product_data: {
                name: params.title,
                description: `Suscripción ${params.plan} - PsyApp`,
              },
              unit_amount: params.price * 100, // Stripe usa centavos
            },
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/cancel`,
        client_reference_id: `${params.psychologistId}__${params.plan}`,
        customer_email: params.email,
        metadata: {
          psychologistId: params.psychologistId,
          plan: params.plan,
        },
      });

      return {
        id: session.id,
        url: session.url,
      };
    } catch (err: any) {
      console.error('[Stripe] Error:', err.message || err);
      throw new BadRequestException('Error al crear la sesión de pago con Stripe.');
    }
  }
}

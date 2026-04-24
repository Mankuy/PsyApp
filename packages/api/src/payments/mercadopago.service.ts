import { Injectable, BadRequestException } from '@nestjs/common';
import { MercadoPagoConfig, Preference } from 'mercadopago';

@Injectable()
export class MercadoPagoService {
  private client: MercadoPagoConfig;
  private isMock: boolean;

  constructor() {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    this.isMock = !accessToken || accessToken.includes('dummy');
    
    if (this.isMock) {
      console.warn('[MercadoPago] MERCADOPAGO_ACCESS_TOKEN no configurado. Modo desarrollo activado.');
    }
    
    this.client = new MercadoPagoConfig({
      accessToken: accessToken || 'TEST-0000000000000000-000000-dummy',
      options: { timeout: 5000 },
    });
  }

  async createPreference(params: {
    psychologistId: string;
    email: string;
    plan: 'pro' | 'enterprise';
    price: number;
    title: string;
  }) {
    if (this.isMock) {
      // Modo desarrollo: devolvemos un link simulado
      return {
        id: `mock-${Date.now()}`,
        init_point: `http://localhost:5173/payment/mock?plan=${params.plan}&price=${params.price}`,
        sandbox_init_point: `http://localhost:5173/payment/mock?plan=${params.plan}&price=${params.price}`,
        mock: true,
      };
    }

    try {
      const preference = new Preference(this.client);

      const body = {
        items: [
          {
            id: `${params.plan}-${params.psychologistId}`,
            title: params.title,
            description: `Suscripción ${params.plan} - PsyApp`,
            quantity: 1,
            currency_id: 'UYU',
            unit_price: params.price,
          },
        ],
        payer: {
          email: params.email,
        },
        external_reference: `${params.psychologistId}__${params.plan}`,
        back_urls: {
          success: process.env.FRONTEND_URL + '/payment/success' || 'http://localhost:5173/payment/success',
          failure: process.env.FRONTEND_URL + '/payment/failure' || 'http://localhost:5173/payment/failure',
          pending: process.env.FRONTEND_URL + '/payment/pending' || 'http://localhost:5173/payment/pending',
        },
        auto_return: 'approved',
        notification_url: process.env.MP_WEBHOOK_URL || 'http://localhost:3000/api/payments/webhook',
      };

      const response = await preference.create({ body });
      return {
        id: response.id,
        init_point: response.init_point,
        sandbox_init_point: response.sandbox_init_point,
      };
    } catch (err: any) {
      console.error('[MercadoPago] Error:', err.message || err);
      throw new BadRequestException(
        'Error al crear la preferencia de pago. Verificá tu configuración de MercadoPago.'
      );
    }
  }
}

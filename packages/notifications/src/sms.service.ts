export interface SmsMessage {
  to: string | string[];
  body: string;
  from?: string;
}

export interface SmsDeliveryResult {
  messageId: string;
  status: 'queued' | 'sent' | 'failed' | 'delivered';
  timestamp: Date;
  error?: string;
}

export interface SmsService {
  send(message: SmsMessage): Promise<SmsDeliveryResult>;
  sendBulk(messages: SmsMessage[]): Promise<SmsDeliveryResult[]>;
  getStatus(messageId: string): Promise<SmsDeliveryResult | null>;
}

export abstract class BaseSmsService implements SmsService {
  abstract send(message: SmsMessage): Promise<SmsDeliveryResult>;

  async sendBulk(messages: SmsMessage[]): Promise<SmsDeliveryResult[]> {
    return Promise.all(messages.map((msg) => this.send(msg)));
  }

  abstract getStatus(messageId: string): Promise<SmsDeliveryResult | null>;
}

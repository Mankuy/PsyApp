export interface EmailMessage {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  body: string;
  html?: string;
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

export interface EmailService {
  send(message: EmailMessage): Promise<void>;
  sendBulk(messages: EmailMessage[]): Promise<void>;
}

export abstract class BaseEmailService implements EmailService {
  abstract send(message: EmailMessage): Promise<void>;

  async sendBulk(messages: EmailMessage[]): Promise<void> {
    await Promise.all(messages.map((msg) => this.send(msg)));
  }
}

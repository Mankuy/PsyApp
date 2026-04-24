import { Injectable } from '@nestjs/common';
import * as CryptoJS from 'crypto-js';

@Injectable()
export class EncryptionService {
  private readonly key: string;

  constructor() {
    this.key = process.env.ENCRYPTION_KEY || 'default-dev-key-change-me';
  }

  encrypt(plainText: string): string {
    if (!plainText) return plainText;
    const iv = CryptoJS.lib.WordArray.random(16);
    const encrypted = CryptoJS.AES.encrypt(plainText, this.key, {
      iv,
    });
    return iv.toString(CryptoJS.enc.Base64) + ':' + encrypted.toString();
  }

  decrypt(cipherText: string): string {
    if (!cipherText) return cipherText;
    try {
      const parts = cipherText.split(':');
      if (parts.length !== 2) return cipherText;
      const iv = CryptoJS.enc.Base64.parse(parts[0]);
      const decrypted = CryptoJS.AES.decrypt(parts[1], this.key, { iv });
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch {
      return cipherText;
    }
  }

  hash(text: string): string {
    return CryptoJS.SHA256(text).toString();
  }
}

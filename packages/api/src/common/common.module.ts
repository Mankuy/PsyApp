import { Module } from '@nestjs/common';
import { EncryptionModule } from './encryption/encryption.module';
import { MiddlewareModule } from './middleware/middleware.module';

@Module({
  imports: [EncryptionModule, MiddlewareModule],
  exports: [EncryptionModule],
})
export class CommonModule {}

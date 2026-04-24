import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { AuditMiddleware } from './audit.middleware';

@Module({})
export class MiddlewareModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuditMiddleware).forRoutes('*');
  }
}

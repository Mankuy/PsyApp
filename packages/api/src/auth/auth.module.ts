import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../common/encryption/encryption.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.ACCESS_TOKEN_SECRET || 'default-access-secret-change-me',
      signOptions: {
        issuer: process.env.TOKEN_ISSUER || 'psyapp-saas',
        audience: process.env.TOKEN_AUDIENCE || 'psyapp-saas-api',
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, PrismaService, EncryptionService],
  exports: [AuthService],
})
export class AuthModule {}

import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaService } from './prisma/prisma.service';
import { CommonModule } from './common/common.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { AvailabilityModule } from './availability/availability.module';
import { NotesModule } from './notes/notes.module';
import { DocumentsModule } from './documents/documents.module';
import { RemindersModule } from './reminders/reminders.module';
import { PatientsModule } from './patients/patients.module';

import { PaymentsModule } from './payments/payments.module';

import { OrganizationsModule } from './organizations/organizations.module';

import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'web', 'dist'),
    }),
    CommonModule, HealthModule, AuthModule, AvailabilityModule, NotesModule, RemindersModule, DocumentsModule, PatientsModule, PaymentsModule, OrganizationsModule, AiModule
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}

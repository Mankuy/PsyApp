import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../common/encryption/encryption.service';
import {
  createJwtPayload,
  parseExpiryToSeconds,
  generateTokenId,
  getDefaultTokenConfig,
  JwtPayload,
} from '@psyapp/core';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly encryption: EncryptionService,
  ) {}

  async validatePsychologist(email: string, password: string) {
    const psychologist = await this.prisma.psychologist.findUnique({
      where: { email },
    });
    if (!psychologist) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const providedHash = this.encryption.hash(password);
    if (providedHash !== psychologist.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return psychologist;
  }

  async validatePatient(email: string, password: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { email },
    });
    if (!patient) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const providedHash = this.encryption.hash(password);
    if (providedHash !== patient.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return patient;
  }

  async loginPsychologist(email: string, password: string) {
    const psychologist = await this.validatePsychologist(email, password);
    const config = getDefaultTokenConfig();
    const payload = createJwtPayload(
      psychologist.id,
      psychologist.email,
      'therapist',
      parseExpiryToSeconds(config.accessTokenExpiry),
      generateTokenId(),
    );
    const accessToken = this.jwtService.sign(payload as any);
    return {
      accessToken,
      user: {
        id: psychologist.id,
        email: psychologist.email,
        name: psychologist.name,
        role: 'PSYCHOLOGIST',
      },
    };
  }

  async registerPsychologist(dto: { email: string; password: string; name: string }) {
    const existing = await this.prisma.psychologist.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new UnauthorizedException('Email already registered');
    }
    const passwordHash = this.encryption.hash(dto.password);
    const psychologist = await this.prisma.psychologist.create({
      data: {
        email: dto.email,
        name: dto.name,
        passwordHash,
        role: 'PSYCHOLOGIST',
        plan: 'FREE',
      },
    });
    const config = getDefaultTokenConfig();
    const payload = createJwtPayload(
      psychologist.id,
      psychologist.email,
      'therapist',
      parseExpiryToSeconds(config.accessTokenExpiry),
      generateTokenId(),
    );
    const accessToken = this.jwtService.sign(payload as any);
    return {
      accessToken,
      user: {
        id: psychologist.id,
        email: psychologist.email,
        name: psychologist.name,
        role: 'PSYCHOLOGIST',
      },
    };
  }

  async loginPatient(email: string, password: string) {
    const patient = await this.validatePatient(email, password);
    const config = getDefaultTokenConfig();
    const payload = createJwtPayload(
      patient.id,
      patient.email,
      'patient',
      parseExpiryToSeconds(config.accessTokenExpiry),
      generateTokenId(),
    );
    const accessToken = this.jwtService.sign(payload as any);
    return {
      accessToken,
      user: {
        id: patient.id,
        email: patient.email,
        name: patient.name,
        role: 'patient',
      },
    };
  }

  async patientMagicLink(email: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { email },
    });
    if (!patient) {
      throw new UnauthorizedException('Patient not found');
    }
    const config = getDefaultTokenConfig();
    const payload = createJwtPayload(
      patient.id,
      patient.email,
      'patient',
      parseExpiryToSeconds(config.accessTokenExpiry),
      generateTokenId(),
    );
    const accessToken = this.jwtService.sign(payload as any);
    return {
      accessToken,
      user: {
        id: patient.id,
        email: patient.email,
        name: patient.name,
        role: 'patient',
      },
    };
  }

  async me(userId: string, role: string) {
    if (role === 'therapist') {
      return this.prisma.psychologist.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true, role: true, plan: true },
      });
    }
    const patient = await this.prisma.patient.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, psychologistId: true },
    });
    if (!patient) return null;
    return { ...patient, role: 'patient' };
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(psychologistId: string) {
    return this.prisma.document.findMany({
      where: { psychologistId },
      include: { patient: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(psychologistId: string, dto: { title: string; patientName?: string; patientId?: string }) {
    let patientId = dto.patientId || null;

    // Si viene patientName, buscar paciente por nombre (crear si no existe)
    if (!patientId && dto.patientName?.trim()) {
      const existing = await this.prisma.patient.findFirst({
        where: {
          psychologistId,
          name: { contains: dto.patientName.trim() },
        },
      });
      if (existing) {
        patientId = existing.id;
      } else {
        // Crear paciente temporal con email generado
        const newPatient = await this.prisma.patient.create({
          data: {
            name: dto.patientName.trim(),
            email: `${Date.now()}@temp.psyapp`,
            psychologistId,
            passwordHash: 'temp',
          },
        });
        patientId = newPatient.id;
      }
    }

    return this.prisma.document.create({
      data: {
        psychologistId,
        patientId,
        title: dto.title,
        filePath: '/uploads/placeholder.pdf',
      },
      include: { patient: { select: { id: true, name: true } } },
    });
  }

  async sign(psychologistId: string, id: string) {
    const doc = await this.prisma.document.findFirst({ where: { id, psychologistId } });
    if (!doc) throw new NotFoundException();
    return this.prisma.document.update({
      where: { id },
      data: { signedAt: new Date() },
      include: { patient: { select: { id: true, name: true } } },
    });
  }

  async remove(psychologistId: string, id: string) {
    const doc = await this.prisma.document.findFirst({ where: { id, psychologistId } });
    if (!doc) throw new NotFoundException();
    await this.prisma.document.delete({ where: { id } });
  }
}

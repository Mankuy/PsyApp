import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PatientsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyAppointments(patientId: string) {
    return this.prisma.appointment.findMany({
      where: { patientId },
      include: {
        psychologist: { select: { id: true, name: true, email: true } },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async getMyProfessional(patientId: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        psychologist: { select: { id: true, name: true, email: true } },
      },
    });
    return patient?.psychologist || null;
  }
}

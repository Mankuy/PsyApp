import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  async generateTimeSlots(
    psychologistId: string,
    from: Date,
    to: Date,
  ): Promise<{ start: Date; end: Date }[]> {
    const rules = await this.prisma.availabilityRule.findMany({
      where: { psychologistId, isActive: true },
    });

    const appointments = await this.prisma.appointment.findMany({
      where: {
        psychologistId,
        startTime: { gte: from },
        endTime: { lte: to },
        status: { not: 'CANCELED' },
      },
    });

    const slots: { start: Date; end: Date }[] = [];
    const current = new Date(from);
    const endDate = new Date(to);

    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      const dayRules = rules.filter((r) => r.dayOfWeek === dayOfWeek);

      for (const rule of dayRules) {
        const [startH, startM] = rule.startTime.split(':').map(Number);
        const [endH, endM] = rule.endTime.split(':').map(Number);
        const slotStart = new Date(current);
        slotStart.setHours(startH, startM, 0, 0);
        const slotEnd = new Date(current);
        slotEnd.setHours(endH, endM, 0, 0);

        let cursor = new Date(slotStart);
        while (cursor < slotEnd) {
          const next = new Date(cursor.getTime() + rule.slotDuration * 60000);
          if (next > slotEnd) break;

          const isBooked = appointments.some(
            (a) =>
              new Date(a.startTime) < next && new Date(a.endTime) > cursor,
          );

          if (!isBooked) {
            slots.push({ start: new Date(cursor), end: new Date(next) });
          }
          cursor = next;
        }
      }

      current.setDate(current.getDate() + 1);
      current.setHours(0, 0, 0, 0);
    }

    return slots;
  }

  async createAppointment(
    psychologistId: string,
    patientId: string,
    start: Date,
    end: Date,
    type: string,
    notes?: string,
  ) {
    const videoLink = this.generateJitsiLink(psychologistId, start);
    return this.prisma.appointment.create({
      data: {
        psychologistId,
        patientId,
        startTime: start,
        endTime: end,
        type: type as any,
        status: 'SCHEDULED',
        notes: notes || null,
        videoLink,
      },
    });
  }

  private generateJitsiLink(psychologistId: string, start: Date): string {
    const roomId = `psyapp-${psychologistId.slice(-8)}-${start.getTime()}`;
    return `https://meet.jit.si/${roomId}`;
  }

  async bookPublic(
    psychologistId: string,
    name: string,
    email: string,
    phone: string,
    start: Date,
    end: Date,
    notes?: string,
  ) {
    // Find or create patient
    let patient = await this.prisma.patient.findUnique({
      where: { email },
    });
    if (!patient) {
      patient = await this.prisma.patient.create({
        data: {
          email,
          name,
          phone: phone || null,
          psychologist: { connect: { id: psychologistId } },
          passwordHash: 'public-booking',
        },
      });
    }
    return this.createAppointment(
      psychologistId,
      patient.id,
      start,
      end,
      'INDIVIDUAL',
      notes,
    );
  }

  async createRule(
    psychologistId: string,
    dto: { dayOfWeek: number; startTime: string; endTime: string; slotDuration: number },
  ) {
    return this.prisma.availabilityRule.create({
      data: {
        psychologistId,
        dayOfWeek: dto.dayOfWeek,
        startTime: dto.startTime,
        endTime: dto.endTime,
        slotDuration: dto.slotDuration,
        isActive: true,
      },
    });
  }

  async getRules(psychologistId: string) {
    return this.prisma.availabilityRule.findMany({
      where: { psychologistId },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }
}

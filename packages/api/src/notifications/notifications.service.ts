import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getUpcoming(psychologistId: string) {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const dayAfter = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    return this.prisma.appointment.findMany({
      where: {
        psychologistId,
        startTime: { gte: tomorrow, lte: dayAfter },
        status: 'SCHEDULED',
      },
      include: {
        patient: { select: { id: true, name: true, email: true, phone: true } },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async getLogs(psychologistId: string) {
    return this.prisma.notificationLog.findMany({
      where: { psychologistId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async sendReminder(psychologistId: string, appointmentId: string) {
    const appointment = await this.prisma.appointment.findFirst({
      where: { id: appointmentId, psychologistId },
      include: { patient: { select: { name: true, email: true, phone: true } } },
    });
    if (!appointment) throw new NotFoundException('Appointment not found');

    // Check if already sent
    const existing = await this.prisma.notificationLog.findFirst({
      where: {
        psychologistId,
        recipient: appointment.patient.email || appointment.patient.phone || '',
        template: 'appointment_reminder',
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    });

    const channels: string[] = [];

    if (appointment.patient.email) {
      channels.push('email');
    }
    if (appointment.patient.phone) {
      channels.push('whatsapp');
    }

    const log = await this.prisma.notificationLog.create({
      data: {
        psychologistId,
        recipientType: channels.length > 0 ? channels.join('+') : 'none',
        recipient: appointment.patient.email || appointment.patient.phone || 'unknown',
        template: 'appointment_reminder',
        subject: 'Recordatorio de cita / Appointment reminder',
        body: `Hola ${appointment.patient.name}, te recordamos tu cita el ${appointment.startTime.toLocaleString()}.`,
        status: existing ? 'DUPLICATE' : 'SENT',
      },
    });

    return { sent: !existing, channels, log };
  }

  async sendAllReminders(psychologistId: string) {
    const upcoming = await this.getUpcoming(psychologistId);
    const results = [];

    for (const appt of upcoming) {
      try {
        const res = await this.sendReminder(psychologistId, appt.id);
        results.push({ appointmentId: appt.id, ...res });
      } catch {
        results.push({ appointmentId: appt.id, sent: false, error: true });
      }
    }

    return { total: upcoming.length, results };
  }
}

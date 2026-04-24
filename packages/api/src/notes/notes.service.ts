import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(psychologistId: string, patientId?: string) {
    return this.prisma.note.findMany({
      where: {
        psychologistId,
        ...(patientId ? { patientId } : {}),
      },
      include: {
        patient: { select: { id: true, name: true } },
        appointment: { select: { id: true, startTime: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async get(psychologistId: string, id: string) {
    const note = await this.prisma.note.findFirst({
      where: { id, psychologistId },
      include: {
        patient: { select: { id: true, name: true } },
        appointment: { select: { id: true, startTime: true } },
      },
    });
    if (!note) throw new NotFoundException('Note not found');
    return note;
  }

  async create(
    psychologistId: string,
    dto: {
      patientId: string;
      appointmentId?: string;
      content: string;
      template?: string;
    },
  ) {
    return this.prisma.note.create({
      data: {
        psychologistId,
        patientId: dto.patientId,
        appointmentId: dto.appointmentId || null,
        content: dto.content,
        summary: this.generateSummary(dto.content),
      },
      include: {
        patient: { select: { id: true, name: true } },
        appointment: { select: { id: true, startTime: true } },
      },
    });
  }

  async update(
    psychologistId: string,
    id: string,
    dto: { content?: string; summary?: string },
  ) {
    const note = await this.prisma.note.findFirst({
      where: { id, psychologistId },
    });
    if (!note) throw new NotFoundException('Note not found');

    return this.prisma.note.update({
      where: { id },
      data: {
        ...(dto.content !== undefined ? { content: dto.content, summary: this.generateSummary(dto.content) } : {}),
        ...(dto.summary !== undefined ? { summary: dto.summary } : {}),
      },
      include: {
        patient: { select: { id: true, name: true } },
        appointment: { select: { id: true, startTime: true } },
      },
    });
  }

  async remove(psychologistId: string, id: string) {
    const note = await this.prisma.note.findFirst({
      where: { id, psychologistId },
    });
    if (!note) throw new NotFoundException('Note not found');
    await this.prisma.note.delete({ where: { id } });
  }

  private generateSummary(content: string): string {
    const sentences = content.split(/[.!?]/).filter((s) => s.trim().length > 0);
    return sentences.slice(0, 2).join('. ').trim() || content.slice(0, 120);
  }
}

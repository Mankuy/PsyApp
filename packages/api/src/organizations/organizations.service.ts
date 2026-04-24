import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type OrgRole = 'OWNER' | 'ADMIN' | 'PROFESSIONAL';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(psychologistId: string, data: { name: string; slug: string }) {
    const existing = await this.prisma.organization.findUnique({
      where: { slug: data.slug },
    });
    if (existing) throw new BadRequestException('Slug ya existe');

    const org = await this.prisma.organization.create({
      data: {
        name: data.name,
        slug: data.slug,
        ownerId: psychologistId,
        plan: 'ENTERPRISE',
      },
      include: { owner: { select: { id: true, name: true, email: true } } },
    });

    // El owner es miembro implícito con rol OWNER
    await this.prisma.organizationMember.create({
      data: {
        organizationId: org.id,
        psychologistId,
        role: 'OWNER',
      },
    });

    return org;
  }

  async getMyOrganization(psychologistId: string) {
    // Buscar como owner
    const owned = await this.prisma.organization.findFirst({
      where: { ownerId: psychologistId },
      include: {
        members: {
          include: {
            psychologist: { select: { id: true, name: true, email: true } },
          },
        },
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { patients: true, members: true } },
      },
    });
    if (owned) return owned;

    // Buscar como miembro
    const member = await this.prisma.organizationMember.findFirst({
      where: { psychologistId },
      include: {
        organization: {
          include: {
            members: {
              include: {
                psychologist: { select: { id: true, name: true, email: true } },
              },
            },
            owner: { select: { id: true, name: true, email: true } },
            _count: { select: { patients: true, members: true } },
          },
        },
      },
    });
    return member?.organization || null;
  }

  async getMembers(orgId: string, psychologistId: string) {
    await this.checkPermission(orgId, psychologistId, ['OWNER', 'ADMIN']);

    return this.prisma.organizationMember.findMany({
      where: { organizationId: orgId },
      include: {
        psychologist: { select: { id: true, name: true, email: true } },
      },
      orderBy: { joinedAt: 'asc' },
    });
  }

  async inviteMember(
    orgId: string,
    inviterId: string,
    data: { email: string; name: string; role?: OrgRole },
  ) {
    await this.checkPermission(orgId, inviterId, ['OWNER', 'ADMIN']);

    // Verificar si ya existe el psicólogo
    let psychologist = await this.prisma.psychologist.findUnique({
      where: { email: data.email },
    });

    if (!psychologist) {
      // Crear cuenta temporal
      psychologist = await this.prisma.psychologist.create({
        data: {
          email: data.email,
          name: data.name,
          passwordHash: 'INVITED',
          plan: 'FREE',
        },
      });
    }

    // Verificar si ya es miembro
    const existingMember = await this.prisma.organizationMember.findUnique({
      where: {
        organizationId_psychologistId: {
          organizationId: orgId,
          psychologistId: psychologist.id,
        },
      },
    });
    if (existingMember) throw new BadRequestException('Ya es miembro de la organización');

    return this.prisma.organizationMember.create({
      data: {
        organizationId: orgId,
        psychologistId: psychologist.id,
        role: data.role || 'PROFESSIONAL',
      },
      include: {
        psychologist: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async updateMemberRole(
    orgId: string,
    actorId: string,
    memberId: string,
    newRole: OrgRole,
  ) {
    await this.checkPermission(orgId, actorId, ['OWNER', 'ADMIN']);

    // Solo OWNER puede asignar rol OWNER
    if (newRole === 'OWNER') {
      await this.checkPermission(orgId, actorId, ['OWNER']);
    }

    const member = await this.prisma.organizationMember.findFirst({
      where: { id: memberId, organizationId: orgId },
    });
    if (!member) throw new NotFoundException('Miembro no encontrado');

    return this.prisma.organizationMember.update({
      where: { id: memberId },
      data: { role: newRole },
      include: {
        psychologist: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async removeMember(orgId: string, actorId: string, memberId: string) {
    await this.checkPermission(orgId, actorId, ['OWNER', 'ADMIN']);

    const member = await this.prisma.organizationMember.findFirst({
      where: { id: memberId, organizationId: orgId },
    });
    if (!member) throw new NotFoundException('Miembro no encontrado');

    // No se puede eliminar al OWNER
    if (member.role === 'OWNER') {
      throw new ForbiddenException('No se puede eliminar al propietario');
    }

    // ADMIN no puede eliminar a otro ADMIN
    const actor = await this.prisma.organizationMember.findFirst({
      where: { organizationId: orgId, psychologistId: actorId },
    });
    if (actor?.role === 'ADMIN' && member.role === 'ADMIN') {
      throw new ForbiddenException('No tenés permiso para eliminar a este miembro');
    }

    await this.prisma.organizationMember.delete({ where: { id: memberId } });
    return { success: true };
  }

  async deleteOrganization(orgId: string, actorId: string) {
    await this.checkPermission(orgId, actorId, ['OWNER']);

    await this.prisma.organization.delete({ where: { id: orgId } });
    return { success: true };
  }

  async getMyRole(orgId: string, psychologistId: string): Promise<OrgRole | null> {
    const member = await this.prisma.organizationMember.findFirst({
      where: { organizationId: orgId, psychologistId },
    });
    return (member?.role as OrgRole) || null;
  }

  private async checkPermission(
    orgId: string,
    psychologistId: string,
    allowedRoles: OrgRole[],
  ) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
    });
    if (!org) throw new NotFoundException('Organización no encontrada');

    // El owner siempre tiene permiso
    if (org.ownerId === psychologistId) return;

    const member = await this.prisma.organizationMember.findFirst({
      where: { organizationId: orgId, psychologistId },
    });

    if (!member || !allowedRoles.includes(member.role as OrgRole)) {
      throw new ForbiddenException('No tenés permiso para realizar esta acción');
    }
  }
}

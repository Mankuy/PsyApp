import {
  Controller, Get, Post, Patch, Delete, Body, Param, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { OrganizationsService } from './organizations.service';

class CreateOrgDto {
  name: string;
  slug: string;
}

class InviteMemberDto {
  email: string;
  name: string;
  role?: 'ADMIN' | 'PROFESSIONAL';
}

class UpdateRoleDto {
  role: 'OWNER' | 'ADMIN' | 'PROFESSIONAL';
}

@Controller('organizations')
@UseGuards(JwtAuthGuard)
export class OrganizationsController {
  constructor(private readonly orgsService: OrganizationsService) {}

  @Post()
  async create(
    @CurrentUser() user: { sub: string },
    @Body() dto: CreateOrgDto,
  ) {
    return {
      success: true,
      data: await this.orgsService.create(user.sub, dto),
    };
  }

  @Get('me')
  async myOrganization(@CurrentUser() user: { sub: string }) {
    const org = await this.orgsService.getMyOrganization(user.sub);
    return { success: true, data: org };
  }

  @Get(':id/members')
  async members(
    @CurrentUser() user: { sub: string },
    @Param('id') orgId: string,
  ) {
    return {
      success: true,
      data: await this.orgsService.getMembers(orgId, user.sub),
    };
  }

  @Post(':id/members')
  async invite(
    @CurrentUser() user: { sub: string },
    @Param('id') orgId: string,
    @Body() dto: InviteMemberDto,
  ) {
    return {
      success: true,
      data: await this.orgsService.inviteMember(orgId, user.sub, dto),
    };
  }

  @Patch(':id/members/:memberId')
  async updateRole(
    @CurrentUser() user: { sub: string },
    @Param('id') orgId: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateRoleDto,
  ) {
    return {
      success: true,
      data: await this.orgsService.updateMemberRole(orgId, user.sub, memberId, dto.role),
    };
  }

  @Delete(':id/members/:memberId')
  async removeMember(
    @CurrentUser() user: { sub: string },
    @Param('id') orgId: string,
    @Param('memberId') memberId: string,
  ) {
    await this.orgsService.removeMember(orgId, user.sub, memberId);
    return { success: true };
  }

  @Delete(':id')
  async delete(
    @CurrentUser() user: { sub: string },
    @Param('id') orgId: string,
  ) {
    await this.orgsService.deleteOrganization(orgId, user.sub);
    return { success: true };
  }
}

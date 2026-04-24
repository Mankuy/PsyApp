import { Controller, Get, Post, Patch, Delete, Param, UseGuards, Body } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { DocumentsService } from './documents.service';

class CreateDocDto {
  title: string;
  patientName?: string;
  patientId?: string;
}

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  async list(@CurrentUser() user: { sub: string }) {
    return { success: true, data: await this.documentsService.list(user.sub) };
  }

  @Post()
  async create(@CurrentUser() user: { sub: string }, @Body() dto: CreateDocDto) {
    return { success: true, data: await this.documentsService.create(user.sub, dto) };
  }

  @Patch(':id/sign')
  async sign(@CurrentUser() user: { sub: string }, @Param('id') id: string) {
    return { success: true, data: await this.documentsService.sign(user.sub, id) };
  }

  @Delete(':id')
  async remove(@CurrentUser() user: { sub: string }, @Param('id') id: string) {
    await this.documentsService.remove(user.sub, id);
    return { success: true };
  }
}

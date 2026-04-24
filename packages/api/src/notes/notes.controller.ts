import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { NotesService } from './notes.service';

class CreateNoteDto {
  patientId: string;
  appointmentId?: string;
  content: string;
  template?: string;
}

class UpdateNoteDto {
  content?: string;
  summary?: string;
}

@Controller('notes')
@UseGuards(JwtAuthGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  async list(
    @CurrentUser() user: { sub: string; role: string },
    @Query('patientId') patientId?: string,
  ) {
    const notes = await this.notesService.list(user.sub, patientId);
    return { success: true, data: notes };
  }

  @Get(':id')
  async get(
    @CurrentUser() user: { sub: string; role: string },
    @Param('id') id: string,
  ) {
    const note = await this.notesService.get(user.sub, id);
    return { success: true, data: note };
  }

  @Post()
  async create(
    @CurrentUser() user: { sub: string; role: string },
    @Body() dto: CreateNoteDto,
  ) {
    const note = await this.notesService.create(user.sub, dto);
    return { success: true, data: note };
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: { sub: string; role: string },
    @Param('id') id: string,
    @Body() dto: UpdateNoteDto,
  ) {
    const note = await this.notesService.update(user.sub, id, dto);
    return { success: true, data: note };
  }

  @Delete(':id')
  async remove(
    @CurrentUser() user: { sub: string; role: string },
    @Param('id') id: string,
  ) {
    await this.notesService.remove(user.sub, id);
    return { success: true };
  }
}

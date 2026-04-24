import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { AvailabilityService } from './availability.service';

class CreateRuleDto {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
}

@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Post('rules')
  @UseGuards(JwtAuthGuard)
  async createRule(
    @CurrentUser() user: { sub: string; role: string },
    @Body() dto: CreateRuleDto,
  ) {
    const rule = await this.availabilityService.createRule(user.sub, dto);
    return { success: true, data: rule };
  }

  @Get('rules')
  @UseGuards(JwtAuthGuard)
  async getRules(@CurrentUser() user: { sub: string; role: string }) {
    const rules = await this.availabilityService.getRules(user.sub);
    return { success: true, data: rules };
  }

  @Get(':psychologistId/slots')
  async getSlots(
    @Param('psychologistId') psychologistId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    if (!from || !to) {
      throw new BadRequestException('from and to query params are required');
    }
    const fromDate = new Date(from);
    const toDate = new Date(to);
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      throw new BadRequestException('Invalid date format');
    }
    const slots = await this.availabilityService.generateTimeSlots(
      psychologistId,
      fromDate,
      toDate,
    );
    return { success: true, data: slots };
  }

  @Post(':psychologistId/book-public')
  async bookPublic(
    @Param('psychologistId') psychologistId: string,
    @Body() body: { start: string; end: string; name: string; email: string; phone?: string; notes?: string },
  ) {
    if (!body.start || !body.end || !body.name || !body.email) {
      throw new BadRequestException('start, end, name and email are required');
    }
    const start = new Date(body.start);
    const end = new Date(body.end);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('Invalid date format');
    }
    const appointment = await this.availabilityService.bookPublic(
      psychologistId,
      body.name,
      body.email,
      body.phone || '',
      start,
      end,
      body.notes,
    );
    return { success: true, data: appointment };
  }
}

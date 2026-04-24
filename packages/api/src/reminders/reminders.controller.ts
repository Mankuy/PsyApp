import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { RemindersService } from './reminders.service';

@Controller('reminders')
@UseGuards(JwtAuthGuard)
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Get('upcoming')
  async upcoming(@CurrentUser() user: { sub: string; role: string }) {
    const appointments = await this.remindersService.getUpcoming(user.sub);
    return { success: true, data: appointments };
  }

  @Get('logs')
  async logs(@CurrentUser() user: { sub: string; role: string }) {
    const logs = await this.remindersService.getLogs(user.sub);
    return { success: true, data: logs };
  }

  @Post('send/:appointmentId')
  async send(
    @CurrentUser() user: { sub: string; role: string },
    @Param('appointmentId') appointmentId: string,
  ) {
    const result = await this.remindersService.sendReminder(
      user.sub,
      appointmentId,
    );
    return { success: true, data: result };
  }

  @Post('send-all')
  async sendAll(@CurrentUser() user: { sub: string; role: string }) {
    const result = await this.remindersService.sendAllReminders(user.sub);
    return { success: true, data: result };
  }
}

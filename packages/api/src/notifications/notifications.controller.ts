import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('upcoming')
  async upcoming(@CurrentUser() user: { sub: string; role: string }) {
    const appointments = await this.notificationsService.getUpcoming(
      user.sub,
    );
    return { success: true, data: appointments };
  }

  @Get('logs')
  async logs(@CurrentUser() user: { sub: string; role: string }) {
    const logs = await this.notificationsService.getLogs(user.sub);
    return { success: true, data: logs };
  }

  @Post('send/:appointmentId')
  async send(
    @CurrentUser() user: { sub: string; role: string },
    @Param('appointmentId') appointmentId: string,
  ) {
    const result = await this.notificationsService.sendReminder(
      user.sub,
      appointmentId,
    );
    return { success: true, data: result };
  }

  @Post('send-all')
  async sendAll(@CurrentUser() user: { sub: string; role: string }) {
    const result = await this.notificationsService.sendAllReminders(user.sub);
    return { success: true, data: result };
  }
}

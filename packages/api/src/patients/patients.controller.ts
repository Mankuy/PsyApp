import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { PatientsService } from './patients.service';

@Controller('patients')
@UseGuards(JwtAuthGuard)
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get('me/appointments')
  async myAppointments(@CurrentUser() user: { sub: string; role: string }) {
    const appointments = await this.patientsService.getMyAppointments(user.sub);
    return { success: true, data: appointments };
  }

  @Get('me/professional')
  async myProfessional(@CurrentUser() user: { sub: string; role: string }) {
    const professional = await this.patientsService.getMyProfessional(user.sub);
    return { success: true, data: professional };
  }
}

import { Controller, Post, Body, UseGuards, Headers } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AiService } from './ai.service';

class AssistDto {
  prompt: string;
}

class OrganizeDto {
  text: string;
}

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('assist')
  async assist(@Body() dto: AssistDto, @Headers('accept-language') lang?: string) {
    return this.aiService.assist(dto.prompt, lang?.startsWith('es') ? 'es' : 'en');
  }

  @Post('organize')
  async organize(@Body() dto: OrganizeDto, @Headers('accept-language') lang?: string) {
    return this.aiService.organize(dto.text, lang?.startsWith('es') ? 'es' : 'en');
  }
}

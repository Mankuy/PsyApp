import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser = require('cookie-parser');
import { RemindersService } from './reminders/reminders.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Schedule reminders check every hour
  const remindersService = app.get(RemindersService);
  setInterval(() => {
    remindersService.checkAndSendReminders().catch(() => {});
  }, 60 * 60 * 1000);
  // Also run once on startup
  remindersService.checkAndSendReminders().catch(() => {});

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();

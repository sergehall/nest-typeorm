import { Controller, Get, Post, Body } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { CreateTelegramDto } from './dto/create-telegram.dto';

@Controller('integrations/telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Post('notification')
  async getWebhook(@Body() payload: any) {
    console.log(payload, 'payload');
    return this.telegramService.getWebhook();
  }

  @Post('webhook')
  async createWebhook(@Body() createTelegramDto: CreateTelegramDto) {
    return this.telegramService.createWebhook(createTelegramDto);
  }

  @Get('auth-bot-link')
  async getAuthBotLink() {
    return this.telegramService.getAuthBotLink();
  }
}

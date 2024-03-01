import { Controller, Get, Post, Body } from '@nestjs/common';
import { TelegramService } from '../application/telegram.service';
import { CreateTelegramDto } from '../dto/create-telegram.dto';
import { TelegramAdapter } from '../../../adapters/telegram/telegram.adapter';

@Controller('integrations/telegram')
export class TelegramController {
  constructor(
    private readonly telegramService: TelegramService,
    private readonly telegramAdapter: TelegramAdapter,
  ) {}

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

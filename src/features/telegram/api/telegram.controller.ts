import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { TelegramService } from '../application/telegram.service';
import { CommandBus } from '@nestjs/cqrs';
import { SendMessageToRecipientCommand } from '../application/use-cases/send-message-to-recipient.use-case';
import { PayloadTelegramMessageType } from '../types/payload-telegram-message.type';

@Controller('integrations/telegram')
export class TelegramController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly telegramService: TelegramService,
  ) {}

  @Post('notification')
  async getWebhook(@Body() payload: PayloadTelegramMessageType) {
    console.log(payload, 'payload');
    await this.commandBus.execute(new SendMessageToRecipientCommand(payload));
    return this.telegramService.getWebhook();
  }

  @Post('webhook')
  async createWebhook(@Body() payload: PayloadTelegramMessageType) {
    console.log(payload, 'payload');
    await this.commandBus.execute(new SendMessageToRecipientCommand(payload));
    return this.telegramService.getWebhook();
  }

  @Get('auth-bot-link')
  async getAuthBotLink(): Promise<string> {
    const activationCode = await this.telegramService.generateActivationCode();
    return `https://t.me/blogger_platform_bot?code=${activationCode}`;
  }

  @Get('activate-bot')
  async activateBot(@Query('code') activationCode: string): Promise<string> {
    const success = await this.telegramService.activateBot(activationCode);
    if (success) {
      return 'Bot activation successful!';
    } else {
      return 'Bot activation failed. Invalid activation code.';
    }
  }
}

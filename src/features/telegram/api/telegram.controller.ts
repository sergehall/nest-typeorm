import { Controller, Get, Post, Body } from '@nestjs/common';
import { TelegramService } from '../application/telegram.service';
import { CreateTelegramDto } from '../dto/create-telegram.dto';
import { CommandBus } from '@nestjs/cqrs';
import { GetCommentsByPostIdCommand } from '../../comments/application/use-cases/get-comments-by-post-id.use-case';
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
  async createWebhook(@Body() createTelegramDto: CreateTelegramDto) {
    return this.telegramService.createWebhook(createTelegramDto);
  }

  @Get('auth-bot-link')
  async getAuthBotLink() {
    return this.telegramService.getAuthBotLink();
  }
}

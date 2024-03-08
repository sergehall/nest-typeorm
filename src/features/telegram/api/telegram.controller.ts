import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { TelegramService } from '../application/telegram.service';
import { CommandBus } from '@nestjs/cqrs';
import { SendMessageToRecipientCommand } from '../application/use-cases/send-message-to-recipient.use-case';
import { PayloadTelegramMessageType } from '../types/payload-telegram-message.type';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUserDto } from '../../users/dto/current-user.dto';
import { GenerateActivationLinkCommand } from '../application/use-cases/generate-activation-code.use-case';
import { BotActivationLink } from '../types/bot-activation-link.type';

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
  @UseGuards(JwtAuthGuard)
  async getAuthBotLink(@Request() req: any): Promise<BotActivationLink> {
    const currentUserDto: CurrentUserDto = req.user;
    return await this.commandBus.execute(
      new GenerateActivationLinkCommand(currentUserDto),
    );
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

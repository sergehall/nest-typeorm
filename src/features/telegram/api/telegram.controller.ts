import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { PayloadTelegramMessageType } from '../types/payload-telegram-message.type';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUserDto } from '../../users/dto/current-user.dto';
import { BotActivationLink } from '../types/bot-activation-link.type';
import { GenerateTelegramActivationLinkCommand } from '../application/use-cases/generate-telegram-activation-code.use-case';
import { ProcessTelegramWebhookMessagesCommand } from '../application/use-cases/process-telegram-webhook-messages.use-case';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Telegram')
@Controller('integrations/telegram')
export class TelegramController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('webhook')
  async telegramBotWebhook(@Body() payload: PayloadTelegramMessageType) {
    console.log(payload, 'payload Webhook');
    return await this.commandBus.execute(
      new ProcessTelegramWebhookMessagesCommand(payload),
    );
  }

  @Get('auth-bot-link')
  @UseGuards(JwtAuthGuard)
  async getAuthBotLink(@Request() req: any): Promise<BotActivationLink> {
    const currentUserDto: CurrentUserDto = req.user;
    return await this.commandBus.execute(
      new GenerateTelegramActivationLinkCommand(currentUserDto),
    );
  }
}

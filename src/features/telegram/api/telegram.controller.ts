import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
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
import { ProcessTelegramMessagesCommand } from '../application/use-cases/process-telegram-messages.use-case';

@Controller('integrations/telegram')
export class TelegramController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('webhook')
  async telegramBotWebhook(@Body() payload: PayloadTelegramMessageType) {
    console.log(payload, 'payload Webhook');
    try {
      return await this.commandBus.execute(
        new ProcessTelegramMessagesCommand(payload),
      );
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
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

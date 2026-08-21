import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { PayloadTelegramMessageType } from '../types/payload-telegram-message.type';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUserDto } from '../../users/dto/current-user.dto';
import { BotActivationLink } from '../types/bot-activation-link.type';
import { GenerateTelegramActivationLinkCommand } from '../application/use-cases/generate-telegram-activation-code.use-case';
import { ProcessTelegramWebhookMessagesCommand } from '../application/use-cases/process-telegram-webhook-messages.use-case';
import { ApiTags } from '@nestjs/swagger';
import { ApiControllerDocumentation } from '../../../api-documentation/decorators/api-controller-documentation.decorator';
import { ApiProviderWebhook } from '../../../api-documentation/decorators/api-provider-webhook.decorator';
import { TelegramWebhookGuard } from '../guards/telegram-webhook.guard';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Telegram')
@ApiControllerDocumentation()
@Controller('integrations/telegram')
export class TelegramController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('webhook')
  @ApiProviderWebhook({ provider: 'Telegram' })
  @UseGuards(TelegramWebhookGuard)
  @Throttle({
    short: { limit: 10, ttl: 1_000 },
    medium: { limit: 100, ttl: 60_000 },
    long: { limit: 1_000, ttl: 3_600_000 },
  })
  async telegramBotWebhook(@Body() payload: PayloadTelegramMessageType) {
    return await this.commandBus.execute(new ProcessTelegramWebhookMessagesCommand(payload));
  }

  @Get('auth-bot-link')
  @UseGuards(JwtAuthGuard)
  async getAuthBotLink(@Request() req: any): Promise<BotActivationLink> {
    const currentUserDto: CurrentUserDto = req.user;
    return await this.commandBus.execute(new GenerateTelegramActivationLinkCommand(currentUserDto));
  }
}

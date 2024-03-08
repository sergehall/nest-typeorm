import { CommandHandler } from '@nestjs/cqrs';
import { TelegramConfig } from '../../../../config/telegram/telegram.config';

export class GetAuthBotLinkCommand {}

@CommandHandler(GetAuthBotLinkCommand)
export class GetAuthBotLinkUseCase {
  constructor(private readonly telegramConfig: TelegramConfig) {}

  async execute(): Promise<string> {
    const tokenTelegramBot = await this.telegramConfig.getTokenTelegram(
      'TOKEN_TELEGRAM_IT_INCUBATOR',
    );
    // return this.telegramConfig.getAuthBotLink();
    return 'https://t.me/blogger_platform_bot?code=123456';
  }
}

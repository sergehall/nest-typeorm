import { Injectable } from '@nestjs/common';
import { BaseConfig } from '../base/base.config';
import { TokenTelegramItIncubatorType } from './types/token-telegram-it-incubator.type';
import { TelegramUsernameBotType } from './types/telegram-username-bot.type';

@Injectable()
export class TelegramConfig extends BaseConfig {
  async getTokenTelegram(
    tokenTelegramItIncubator: TokenTelegramItIncubatorType,
  ): Promise<string> {
    return await this.getTokenTelegramItIncubator(tokenTelegramItIncubator);
  }

  getTokenTelegram2(
    tokenTelegramItIncubator: TokenTelegramItIncubatorType,
  ): string {
    return this.getTokenTelegramItIncubator2(tokenTelegramItIncubator);
  }

  async getUsernameBotTelegram(
    telegramUsernameBot: TelegramUsernameBotType,
  ): Promise<string> {
    return await this.getTelegramUsernameBot(telegramUsernameBot);
  }
}

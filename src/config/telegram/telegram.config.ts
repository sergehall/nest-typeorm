import { Injectable } from '@nestjs/common';
import { BaseConfig } from '../base/base.config';
import { TokenTelegramItIncubatorType } from './types/token-telegram-it-incubator.type';
import { TelegramBotUsernameType } from './types/telegram-bot-username.type';
import { TelegramBotChatIdType } from './types/telegram-bot-chat-id.type';

@Injectable()
export class TelegramConfig extends BaseConfig {
  async getBotToken(
    tokenTelegramItIncubator: TokenTelegramItIncubatorType,
  ): Promise<string> {
    return await this.getTokenTelegramItIncubator(tokenTelegramItIncubator);
  }

  async getBotUsername(
    telegramUsernameBot: TelegramBotUsernameType,
  ): Promise<string> {
    return await this.getTelegramUsernameBot(telegramUsernameBot);
  }
  async getBotChatId(
    telegramBotChatId: TelegramBotChatIdType,
  ): Promise<string> {
    return await this.getValueTelegramBotChatId(telegramBotChatId);
  }
}

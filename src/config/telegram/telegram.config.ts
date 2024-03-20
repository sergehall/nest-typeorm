import { BadRequestException, Injectable } from '@nestjs/common';
import { BaseConfig } from '../base/base.config';
import { TelegramKeysType } from './types/telegram-keys.type';

@Injectable()
export class TelegramConfig extends BaseConfig {
  private config: Record<string, string> = {
    TOKEN_TELEGRAM_IT_INCUBATOR: 'TOKEN_TELEGRAM_IT_INCUBATOR',
    TELEGRAM_BOT_USERNAME: 'TELEGRAM_BOT_USERNAME',
    TELEGRAM_BOT_CHAT_ID: 'TELEGRAM_BOT_CHAT_ID',
  };

  async getTelegramValueByKey(key: TelegramKeysType): Promise<string> {
    if (this.config.hasOwnProperty(key)) {
      return this.getValueTelegram(key);
    } else {
      throw new BadRequestException(
        `Key ${key} not found in Telegram configuration`,
      );
    }
  }

  async getBotToken(key: TelegramKeysType): Promise<string> {
    return await this.getTelegramValueByKey(key);
  }

  async getBotUsername(key: TelegramKeysType): Promise<string> {
    return this.getTelegramValueByKey(key);
  }

  async getBotChatId(key: TelegramKeysType): Promise<string> {
    return this.getTelegramValueByKey(key);
  }

  async getTokenTelegramItIncubator(key: TelegramKeysType): Promise<string> {
    return this.getTelegramValueByKey(key);
  }
}

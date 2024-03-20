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

  async getPayPalValueByKey(key: TelegramKeysType): Promise<string> {
    if (this.config.hasOwnProperty(key)) {
      return this.getValueTelegram(key);
    } else {
      throw new BadRequestException(
        `Key ${key} not found in PayPal configuration`,
      );
    }
  }

  async getBotToken(key: TelegramKeysType): Promise<string> {
    return await this.getPayPalValueByKey(key);
  }

  async getBotUsername(key: TelegramKeysType): Promise<string> {
    return this.getPayPalValueByKey(key);
  }

  async getBotChatId(key: TelegramKeysType): Promise<string> {
    return this.getPayPalValueByKey(key);
  }

  async getTokenTelegramItIncubator(key: TelegramKeysType): Promise<string> {
    return this.getPayPalValueByKey(key);
  }
}

import { Injectable } from '@nestjs/common';
import { BaseConfig } from '../base/base.config';
import { TokenTelegramItIncubator } from './types/token-telegram-it-incubator.types';

@Injectable()
export class TelegramConfig extends BaseConfig {
  async getTokenTelegram(
    tokenTelegramItIncubator: TokenTelegramItIncubator,
  ): Promise<string> {
    return await this.getTokenTelegramItIncubator(tokenTelegramItIncubator);
  }
}

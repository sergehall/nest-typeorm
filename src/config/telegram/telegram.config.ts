import { Injectable } from '@nestjs/common';
import { BaseConfig } from '../base/base.config';
import { TokenTelegramItIncubatorType } from './types/token-telegram-it-incubator.type';
import { TelegramBotUsernameType } from './types/telegram-bot-username.type';
import { TelegramBotChatIdType } from './types/telegram-bot-chat-id.type';
import { TelegramMethodsEnum } from '../../features/telegram/enums/telegram-methods.enum';
import { TelegramEndpointsEnum } from '../../features/telegram/enums/telegram-endpoints.enum';

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

  async getTelegramUrlBotSendMessage(): Promise<string> {
    const tokenTelegramBot = await this.getBotToken(
      'TOKEN_TELEGRAM_IT_INCUBATOR',
    );
    const sendMessage = TelegramMethodsEnum.SEND_MESSAGE;
    return `${TelegramEndpointsEnum.Bot}${tokenTelegramBot}/${sendMessage}`;
  }
}

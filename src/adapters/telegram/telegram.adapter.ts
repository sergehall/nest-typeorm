import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { TelegramConfig } from '../../config/telegram/telegram.config';
import { CommandBus } from '@nestjs/cqrs';
import { SendOurHookToTelegramCommand } from '../../features/telegram/application/use-cases/send-our-hook-to-telegram.use-case';

@Injectable()
export class TelegramAdapter {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly telegramConfig: TelegramConfig,
  ) {}

  async setWebhook() {
    await this.commandBus.execute(new SendOurHookToTelegramCommand());
  }

  async sendMessageToRecipient(text: string, recipientId: number) {
    const tokenTelegramBot = await this.telegramConfig.getTokenTelegram(
      'TOKEN_TELEGRAM_IT_INCUBATOR',
    );

    await axios.post(
      `https://api.telegram.org/bot${tokenTelegramBot}/sendMessage`,
      {
        chat_id: recipientId,
        text: text,
      },
    );
  }
}

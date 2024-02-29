import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { TelegramConfig } from '../../config/telegram/telegram.config';
import { PostgresConfig } from '../../config/db/postgres/postgres.config';

@Injectable()
export class TelegramAdapter {
  constructor(
    private readonly postgresConfig: PostgresConfig,
    private readonly telegramConfig: TelegramConfig,
  ) {}

  async sendMessageToRecipient(text: string, recipientId: number) {
    const tokenTelegramBot = await this.telegramConfig.getTokenIncubator(
      'TOKEN_INCUBATOR_TEST_34',
    );

    await axios.post(
      `https://api.telegram.org/bot${tokenTelegramBot}/sendMessage`,
      {
        chat_id: recipientId,
        text: text,
      },
    );
  }

  async setWebhook() {
    const tokenTelegramBot = await this.telegramConfig.getTokenIncubator(
      'TOKEN_INCUBATOR_TEST_34',
    );

    const baseUrl = await this.postgresConfig.getDomain('PG_DOMAIN_HEROKU');
    const url = baseUrl + '/integrations/telegram/notification';

    await axios.post(
      `https://api.telegram.org/bot${tokenTelegramBot}/setWebhook`,
      { url: url }, // Send url as an object
    );
  }
}

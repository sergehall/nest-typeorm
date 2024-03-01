import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import axios from 'axios';
import { PostgresConfig } from '../../../../config/db/postgres/postgres.config';
import { TelegramConfig } from '../../../../config/telegram/telegram.config';

export class SendOurWebhookToTelegramCommand {
  constructor() {}
}

@CommandHandler(SendOurWebhookToTelegramCommand)
export class SendOurWebhookToTelegramUseCase
  implements ICommandHandler<SendOurWebhookToTelegramCommand>
{
  constructor(
    private readonly postgresConfig: PostgresConfig,
    private readonly telegramConfig: TelegramConfig,
  ) {}
  async execute() {
    const tokenTelegramBot = await this.telegramConfig.getTokenTelegram(
      'TOKEN_TELEGRAM_IT_INCUBATOR',
    );

    const method = 'setWebhook';
    const telegramUrl = `https://api.telegram.org/bot${tokenTelegramBot}/${method}`;

    const baseUrl = await this.postgresConfig.getDomain('PG_DOMAIN_HEROKU');
    const url = baseUrl + '/integrations/telegram/notification';

    await axios.post(telegramUrl, { url: url });
  }
}

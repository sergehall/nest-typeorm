import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import axios from 'axios';
import { PostgresConfig } from '../../../../config/db/postgres/postgres.config';
import { TelegramConfig } from '../../../../config/telegram/telegram.config';

export class SendOurHookToTelegramCommand {
  constructor() {}
}

@CommandHandler(SendOurHookToTelegramCommand)
export class SendOurHookToTelegramUseCase
  implements ICommandHandler<SendOurHookToTelegramCommand>
{
  constructor(
    private readonly postgresConfig: PostgresConfig,
    private readonly telegramConfig: TelegramConfig,
  ) {}
  async execute(comand: SendOurHookToTelegramCommand) {
    const tokenTelegramBot = await this.telegramConfig.getTokenTelegram(
      'TOKEN_TELEGRAM_IT_INCUBATOR',
    );

    const baseUrl = await this.postgresConfig.getDomain('PG_DOMAIN_HEROKU');
    const url = baseUrl + '/integrations/telegram/notification';

    await axios.post(
      `https://api.telegram.org/bot${tokenTelegramBot}/setWebhook`,
      { url: url }, // Send url as an object
    );
  }
}

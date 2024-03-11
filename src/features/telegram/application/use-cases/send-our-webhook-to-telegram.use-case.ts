import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostgresConfig } from '../../../../config/db/postgres/postgres.config';
import { TelegramConfig } from '../../../../config/telegram/telegram.config';
import { TelegramEndpointsEnum } from '../../enums/telegram-endpoints.enum';
import { TelegramMethodsEnum } from '../../enums/telegram-methods.enum';
import axios from 'axios';

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
    const tokenTelegramBot = await this.telegramConfig.getBotToken(
      'TOKEN_TELEGRAM_IT_INCUBATOR',
    );

    const method = TelegramMethodsEnum.SET_WEBHOOK;
    const telegramUrl = `${TelegramEndpointsEnum.Bot}${tokenTelegramBot}/${method}`;

    const baseUrl = await this.postgresConfig.getDomain('PG_DOMAIN_HEROKU');

    const url = baseUrl + '/integrations/telegram/webhook';

    await axios.post(telegramUrl, { url: url });
  }
}

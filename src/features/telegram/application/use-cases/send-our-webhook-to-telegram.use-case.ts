import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import axios from 'axios';
import { PostgresConfig } from '../../../../config/db/postgres/postgres.config';
import { TelegramConfig } from '../../../../config/telegram/telegram.config';
import { TelegramApiEndpointsEnum } from '../../enums/telegram-api-endpoints.enum';
import { TelegramMethodsEnum } from '../../enums/telegram-methods.enum';

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

    const method = TelegramMethodsEnum.SET_WEBHOOK;
    const telegramUrl = `${TelegramApiEndpointsEnum.Bot}${tokenTelegramBot}/${method}`;

    const baseUrl = await this.postgresConfig.getDomain('PG_DOMAIN_HEROKU');
    const url = baseUrl + '/integrations/telegram/notification';

    await axios.post(telegramUrl, { url: url });
  }
}
import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { TelegramApiEndpointsEnum } from '../../features/telegram/enums/telegram-api-endpoints.enum';
import { TelegramConfig } from '../../config/telegram/telegram.config';

@Injectable()
export class TelegramAdapter {
  axiosInstance: AxiosInstance;
  tokenTelegramBot: string;
  constructor(private readonly telegramConfig: TelegramConfig) {
    this.tokenTelegramBot = this.telegramConfig.getTokenTelegram2(
      'TOKEN_TELEGRAM_IT_INCUBATOR',
    );
    this.axiosInstance = axios.create({
      baseURL: `${TelegramApiEndpointsEnum.Bot}` + `${this.tokenTelegramBot}/`,
    });
  }

  async setWebhook() {
    await this.axiosInstance.post('/setWebhook', {
      url: `https://nest-typeorm-heroku-fc82366654b2.herokuapp.com/integrations/telegram/webhook`,
    });
  }
}

// import { Injectable } from '@nestjs/common';
// import { CommandBus } from '@nestjs/cqrs';
// import { SendOurWebhookToTelegramCommand } from '../../features/telegram/application/use-cases/send-our-webhook-to-telegram.use-case';
//
// @Injectable()
// export class TelegramAdapter {
//   constructor(private readonly commandBus: CommandBus) {}
//
//   async setWebhook() {
//     await this.commandBus.execute(new SendOurWebhookToTelegramCommand());
//   }
// }

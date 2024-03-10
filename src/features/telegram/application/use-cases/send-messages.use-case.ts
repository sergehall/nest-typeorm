import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import axios from 'axios';
import { TelegramConfig } from '../../../../config/telegram/telegram.config';
import { PayloadTelegramMessageType } from '../../types/payload-telegram-message.type';
import { TelegramApiEndpointsEnum } from '../../enums/telegram-api-endpoints.enum';
import { TelegramMethodsEnum } from '../../enums/telegram-methods.enum';
import { ManageTelegramBotCommand } from './manage-telegram-bot.use-case';

export class SendMessagesCommand {
  constructor(public payloadTelegramMessage: PayloadTelegramMessageType) {}
}

@CommandHandler(SendMessagesCommand)
export class SendMessagesUseCase
  implements ICommandHandler<SendMessagesCommand>
{
  constructor(
    private readonly commandBus: CommandBus,
    private readonly telegramConfig: TelegramConfig,
  ) {}

  async execute(command: SendMessagesCommand) {
    const { payloadTelegramMessage } = command;

    const tokenTelegramBot = await this.telegramConfig.getTokenTelegram(
      'TOKEN_TELEGRAM_IT_INCUBATOR',
    );

    const sendMessage = TelegramMethodsEnum.SEND_MESSAGE;

    const telegramUrl = `${TelegramApiEndpointsEnum.Bot}${tokenTelegramBot}/${sendMessage}`;

    const data = {
      chat_id: payloadTelegramMessage.message.from.id,
      text: 'not understand you, please try again!',
    };

    await axios.post(telegramUrl, data);

    // if (payloadTelegramMessage.message.text.includes('/start')) {
    //   if (payloadTelegramMessage.message.text.includes('code')) {
    //     const answerToRecipient: string = await this.commandBus.execute(
    //       new ManageTelegramBotCommand(payloadTelegramMessage),
    //     );
    //     const data = {
    //       chat_id: payloadTelegramMessage.message.from.id,
    //       text: answerToRecipient,
    //     };
    //
    //     await axios.post(telegramUrl, data);
    //   }
    // } else {
    //   await axios.post(telegramUrl, {
    //     chat_id: payloadTelegramMessage.message.from.id,
    //     text: 'not understand you, please try again!',
    //   });
    // }

    // if (payloadTelegramMessage.message.text) {
    //   const answerToRecipient = await this.commandBus.execute(
    //     new TelegramTextParserCommand(payloadTelegramMessage),
    //   );
    //   const data = {
    //     chat_id: payloadTelegramMessage.message.from.id,
    //     text: answerToRecipient,
    //   };
    //
    //   await axios.post(telegramUrl, data);
    // }
  }
}

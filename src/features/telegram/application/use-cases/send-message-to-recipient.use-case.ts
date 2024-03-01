import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import axios from 'axios';
import { TelegramConfig } from '../../../../config/telegram/telegram.config';
import { PayloadTelegramMessageType } from '../../types/payload-telegram-message.type';
import { TelegramApiEndpointsEnum } from '../../enums/telegram-api-endpoints.enum';
import { TelegramMethodsEnum } from '../../enums/telegram-methods.enum';
import { TelegramTextParserCommand } from './telegram-text-parser.use-case';

export class SendMessageToRecipientCommand {
  constructor(public payloadTelegramMessage: PayloadTelegramMessageType) {}
}

@CommandHandler(SendMessageToRecipientCommand)
export class SendMessageToRecipientUseCase
  implements ICommandHandler<SendMessageToRecipientCommand>
{
  constructor(
    private readonly commandBus: CommandBus,
    private readonly telegramConfig: TelegramConfig,
  ) {}
  async execute(command: SendMessageToRecipientCommand) {
    const { payloadTelegramMessage } = command;

    const text = payloadTelegramMessage.message.text;

    const tokenTelegramBot = await this.telegramConfig.getTokenTelegram(
      'TOKEN_TELEGRAM_IT_INCUBATOR',
    );

    const method = TelegramMethodsEnum.SEND_MESSAGE;
    const telegramUrl = `${TelegramApiEndpointsEnum.Bot}${tokenTelegramBot}/${method}`;

    const answerToRecipient = await this.commandBus.execute(
      new TelegramTextParserCommand(text),
    );

    const data = {
      chat_id: payloadTelegramMessage.message.from.id,
      text: answerToRecipient,
    };

    await axios.post(telegramUrl, data);
  }
}

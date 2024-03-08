import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import axios from 'axios';
import { TelegramConfig } from '../../../../config/telegram/telegram.config';
import { PayloadTelegramMessageType } from '../../types/payload-telegram-message.type';
import { TelegramApiEndpointsEnum } from '../../enums/telegram-api-endpoints.enum';
import { TelegramMethodsEnum } from '../../enums/telegram-methods.enum';
import { TelegramTextParserCommand } from './telegram-text-parser.use-case';
import { ActivateTelegramBotCommand } from './activate-telegram-bot.use-case';

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

    if (payloadTelegramMessage.message.text.includes('start code=')) {
      const answerToRecipient = await this.commandBus.execute(
        new ActivateTelegramBotCommand(payloadTelegramMessage),
      );
      const data = {
        chat_id: payloadTelegramMessage.message.from.id,
        text: answerToRecipient,
      };

      await axios.post(telegramUrl, data);
    }
    if (payloadTelegramMessage.message.text) {
      const answerToRecipient = await this.commandBus.execute(
        new TelegramTextParserCommand(payloadTelegramMessage),
      );
      const data = {
        chat_id: payloadTelegramMessage.message.from.id,
        text: answerToRecipient,
      };

      await axios.post(telegramUrl, data);
    }
  }
}

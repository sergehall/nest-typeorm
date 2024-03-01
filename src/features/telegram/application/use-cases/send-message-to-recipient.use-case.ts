import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import axios from 'axios';
import { TelegramConfig } from '../../../../config/telegram/telegram.config';
import { PayloadTelegramMessageType } from '../../types/payload-telegram-message.type';

export class SendMessageToRecipientCommand {
  constructor(public payloadTelegramMessage: PayloadTelegramMessageType) {}
}

@CommandHandler(SendMessageToRecipientCommand)
export class SendMessageToRecipientUseCase
  implements ICommandHandler<SendMessageToRecipientCommand>
{
  constructor(private readonly telegramConfig: TelegramConfig) {}
  async execute(command: SendMessageToRecipientCommand) {
    const { payloadTelegramMessage } = command;

    const tokenTelegramBot = await this.telegramConfig.getTokenTelegram(
      'TOKEN_TELEGRAM_IT_INCUBATOR',
    );

    const method = 'sendMessage';
    const telegramUrl = `https://api.telegram.org/bot${tokenTelegramBot}/${method}`;

    const data = {
      chat_id: payloadTelegramMessage.message.from.id,
      text: payloadTelegramMessage.message.text,
    };

    await axios.post(telegramUrl, data);
  }
}

import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import axios from 'axios';
import { TelegramConfig } from '../../../../config/telegram/telegram.config';
import { PayloadTelegramMessageType } from '../../types/payload-telegram-message.type';
import { TelegramApiEndpointsEnum } from '../../enums/telegram-api-endpoints.enum';
import { TelegramMethodsEnum } from '../../enums/telegram-methods.enum';
import { ManageTelegramBotCommand } from './manage-telegram-bot.use-case';
import { TelegramTextParserCommand } from './telegram-text-parser.use-case';

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

    if (payloadTelegramMessage.message.text) {
      const text: string = payloadTelegramMessage.message.text;

      // Check if the text starts with '/start'
      if (text.startsWith('/start')) {
        // If the text starts with '/start' but does not contain 'code=', send a new user welcome message
        if (!text.includes('code=')) {
          await this.sendNewUserWelcomeMessage(payloadTelegramMessage);
          return;
        }

        // If the text starts with '/start' and contains 'code=', proceed with code extraction and activation
        const code = await this.extractActivationCode(text);
        if (code) {
          const answerToRecipient: string = await this.commandBus.execute(
            new ManageTelegramBotCommand(payloadTelegramMessage),
          );
          await this.sendTelegramMessage(
            payloadTelegramMessage.message.from.id,
            answerToRecipient,
          );
          return;
        }
      }

      // If the text does not start with '/start', or does not contain 'code=', execute TelegramTextParserCommand
      const answerToRecipient = await this.commandBus.execute(
        new TelegramTextParserCommand(payloadTelegramMessage),
      );
      await this.sendTelegramMessage(
        payloadTelegramMessage.message.from.id,
        answerToRecipient,
      );
    } else {
      // If the message does not contain text, send a default response
      await this.sendTelegramMessage(
        payloadTelegramMessage.message.from.id,
        'do not understand you, please try again!',
      );
    }
  }

  // Helper function to send a message via Telegram
  private async sendTelegramMessage(
    chatId: number,
    text: string,
  ): Promise<void> {
    const telegramUrl = await this.getTelegramUrl();
    const data = { chat_id: chatId, text };
    await axios.post(telegramUrl, data);
  }

  // Helper function to send a new user welcome message
  private async sendNewUserWelcomeMessage(
    payloadTelegramMessage: PayloadTelegramMessageType,
  ): Promise<void> {
    const firstName =
      payloadTelegramMessage.message.from.first_name || 'new user';
    const welcomeMessage = `Welcome, ${firstName}!`;

    await this.sendTelegramMessage(
      payloadTelegramMessage.message.from.id,
      welcomeMessage,
    );
  }

  // Helper function to extract the activation code
  private async extractActivationCode(message: string): Promise<string | null> {
    if (message.includes('code=')) {
      const parts = message.split(' ');
      for (const part of parts) {
        if (part.includes('code=')) {
          return part.split('=')[1];
        }
      }
    }
    return null;
  }

  // Helper function to get the Telegram API URL
  private async getTelegramUrl(): Promise<string> {
    const tokenTelegramBot = await this.telegramConfig.getTokenTelegram(
      'TOKEN_TELEGRAM_IT_INCUBATOR',
    );
    const sendMessage = TelegramMethodsEnum.SEND_MESSAGE;
    return `${TelegramApiEndpointsEnum.Bot}${tokenTelegramBot}/${sendMessage}`;
  }
}

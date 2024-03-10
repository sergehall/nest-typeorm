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

    if (!payloadTelegramMessage.message.text) {
      await this.sendTelegramMessage(
        payloadTelegramMessage.message.from.id,
        'do not understand you, please try again!',
      );
      return;
    }

    const text: string = payloadTelegramMessage.message.text;

    // Define a regular expression pattern to match '/start ' followed by any characters
    const patternStart = /\/start\s+(.+)/;
    // Execute the regular expression pattern on the text
    const match = text.match(patternStart);

    if (match) {
      // If the text starts with '/start' but does not contain 'code=', send a new user welcome message
      const partAfterStart = match[1];

      if (!partAfterStart.startsWith('code')) {
        await this.sendNewUserWelcomeMessage(payloadTelegramMessage);
        return;
      }

      // If the text starts with '/start' and contains 'code=', proceed with code extraction and activation
      const code = await this.extractActivationCode(text);
      if (code) {
        const answerToRecipient: string = await this.commandBus.execute(
          new ManageTelegramBotCommand(payloadTelegramMessage, code),
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

  private async extractActivationCode(message: string): Promise<string | null> {
    // Find the index of the word 'code' in the message
    const codeIndex = message.indexOf('code');

    // If 'code' is found in the message
    if (codeIndex !== -1) {
      // Extract the substring starting from 'code' until the end of the message
      return message.substring(codeIndex);
    }

    return null; // Return null if 'code' is not found in the message
  }

  // // Helper function to extract the activation code
  // private async extractActivationCode(message: string): Promise<string | null> {
  //   if (message.includes('code=')) {
  //     const parts = message.split(' ');
  //     for (const part of parts) {
  //       if (part.includes('code=')) {
  //         return part.split('=')[1];
  //       }
  //     }
  //   }
  //   return null;
  // }

  // Helper function to get the Telegram API URL
  private async getTelegramUrl(): Promise<string> {
    const tokenTelegramBot = await this.telegramConfig.getTokenTelegram(
      'TOKEN_TELEGRAM_IT_INCUBATOR',
    );
    const sendMessage = TelegramMethodsEnum.SEND_MESSAGE;
    return `${TelegramApiEndpointsEnum.Bot}${tokenTelegramBot}/${sendMessage}`;
  }
}

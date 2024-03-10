import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import axios from 'axios';
import { TelegramConfig } from '../../../../config/telegram/telegram.config';
import { PayloadTelegramMessageType } from '../../types/payload-telegram-message.type';
import { TelegramEndpointsEnum } from '../../enums/telegram-endpoints.enum';
import { TelegramMethodsEnum } from '../../enums/telegram-methods.enum';
import { ManageTelegramBotCommand } from './manage-telegram-bot.use-case';
import { TelegramTextParserCommand } from './telegram-text-parser.use-case';
import { InternalServerErrorException } from '@nestjs/common';

export class ProcessTelegramMessagesCommand {
  constructor(public payloadTelegramMessage: PayloadTelegramMessageType) {}
}
@CommandHandler(ProcessTelegramMessagesCommand)
export class ProcessTelegramMessagesUseCase
  implements ICommandHandler<ProcessTelegramMessagesCommand>
{
  constructor(
    private readonly commandBus: CommandBus,
    private readonly telegramConfig: TelegramConfig,
  ) {}

  async execute(command: ProcessTelegramMessagesCommand) {
    try {
      const { payloadTelegramMessage } = command;

      if (!payloadTelegramMessage.message?.text) {
        await this.sendDoNotUnderstandYouMessage(payloadTelegramMessage);
        return;
      }

      const { text } = payloadTelegramMessage.message;

      if (text.startsWith('/start')) {
        const parts = text.split(' ')[1];

        if (!parts) {
          await this.sendNewUserWelcomeMessage(payloadTelegramMessage);
          return;
        }

        if (!parts.startsWith('code')) {
          await this.sendUnknownCommandMessage(payloadTelegramMessage, parts);
          return;
        }

        const code = await this.extractActivationCode(parts);

        if (code) {
          const feedbackMessage: string = await this.commandBus.execute(
            new ManageTelegramBotCommand(payloadTelegramMessage, code),
          );

          await this.sendTelegramMessage(
            payloadTelegramMessage.message.from.id,
            feedbackMessage,
          );
          return;
        }
      }

      const feedbackMessage = await this.commandBus.execute(
        new TelegramTextParserCommand(payloadTelegramMessage),
      );
      await this.sendTelegramMessage(
        payloadTelegramMessage.message.from.id,
        feedbackMessage,
      );
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  private async sendTelegramMessage(
    chatId: number,
    text: string,
  ): Promise<void> {
    const telegramUrl = await this.getTelegramUrl();
    const data = { chat_id: chatId, text };
    await axios.post(telegramUrl, data);
  }

  private async sendNewUserWelcomeMessage(
    payloadTelegramMessage: PayloadTelegramMessageType,
  ): Promise<void> {
    const { first_name } = payloadTelegramMessage.message.from;
    const welcomeMessage = `Welcome, ${first_name || 'new user'}!`;
    await this.sendTelegramMessage(
      payloadTelegramMessage.message.from.id,
      welcomeMessage,
    );
  }

  private async sendUnknownCommandMessage(
    payloadTelegramMessage: PayloadTelegramMessageType,
    parts: string,
  ): Promise<void> {
    const { first_name } = payloadTelegramMessage.message.from;
    const unknownCommandMessage = `Welcome, ${first_name || 'new user'}! But I do not understand the command: ${parts}!`;
    await this.sendTelegramMessage(
      payloadTelegramMessage.message.from.id,
      unknownCommandMessage,
    );
  }

  private async sendDoNotUnderstandYouMessage(
    payloadTelegramMessage: PayloadTelegramMessageType,
  ): Promise<void> {
    console.log(
      payloadTelegramMessage,
      'payload sendDoNotUnderstandYouMessage',
    );
    const my_chatId = 378548569;

    const unknownCommandMessage = `Welcome, ${payloadTelegramMessage || 'new user'}! But I do not understand you!`;
    await this.sendTelegramMessage(my_chatId, unknownCommandMessage);
  }

  private async extractActivationCode(message: string): Promise<string | null> {
    const codeIndex = message.indexOf('code=');

    if (codeIndex !== -1) {
      return message.substring(codeIndex + 5);
    }

    const codeWithoutEqualIndex = message.indexOf('code');

    if (codeWithoutEqualIndex !== -1) {
      return message.substring(codeWithoutEqualIndex + 4);
    }

    return null;
  }

  private async getTelegramUrl(): Promise<string> {
    const tokenTelegramBot = await this.telegramConfig.getTokenTelegram(
      'TOKEN_TELEGRAM_IT_INCUBATOR',
    );
    const sendMessage = TelegramMethodsEnum.SEND_MESSAGE;
    return `${TelegramEndpointsEnum.Bot}${tokenTelegramBot}/${sendMessage}`;
  }
}

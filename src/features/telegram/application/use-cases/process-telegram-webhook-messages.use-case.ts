import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import axios from 'axios';
import { TelegramConfig } from '../../../../config/telegram/telegram.config';
import { PayloadTelegramMessageType } from '../../types/payload-telegram-message.type';
import { ManageTelegramBotCommand } from './manage-telegram-bot.use-case';
import { TelegramTextParserCommand } from './telegram-text-parser.use-case';
import { InternalServerErrorException } from '@nestjs/common';
import { TelegramMethodsEnum } from '../../enums/telegram-methods.enum';
import { TelegramUrlsEnum } from '../../enums/telegram-urls.enum';

export class ProcessTelegramWebhookMessagesCommand {
  constructor(public payloadTelegramMessage: PayloadTelegramMessageType) {}
}
@CommandHandler(ProcessTelegramWebhookMessagesCommand)
export class ProcessTelegramWebhookMessagesUseCase
  implements ICommandHandler<ProcessTelegramWebhookMessagesCommand>
{
  constructor(
    private readonly commandBus: CommandBus,
    private readonly telegramConfig: TelegramConfig,
  ) {}

  async execute(command: ProcessTelegramWebhookMessagesCommand) {
    try {
      const { payloadTelegramMessage } = command;
      const { message } = payloadTelegramMessage;

      if (!message) {
        await this.sendMemberStatusMessage(payloadTelegramMessage);
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
          const feedbackMessage: string | null = await this.commandBus.execute(
            new ManageTelegramBotCommand(payloadTelegramMessage, code),
          );
          if (!feedbackMessage) {
            await this.sendTelegramMessage(
              payloadTelegramMessage.message.from.id,
              `User with ID ${code} not found`,
            );
            return;
          }

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
    const tokenTelegramBot = await this.telegramConfig.getTelegramValue(
      'TOKEN_TELEGRAM_IT_INCUBATOR',
    );
    const sendMessage = TelegramMethodsEnum.SEND_MESSAGE;

    const telegramUrl = `${TelegramUrlsEnum.Bot}${tokenTelegramBot}/${sendMessage}`;

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

  private async sendMemberStatusMessage(
    payloadTelegramMessage: PayloadTelegramMessageType,
  ): Promise<void> {
    const bot_chatId = await this.telegramConfig.getTelegramValue(
      'TELEGRAM_BOT_CHAT_ID',
    );
    let name = 'new_user';
    let userName = 'user_name';
    let status = 'status';
    if (payloadTelegramMessage.my_chat_member) {
      name = payloadTelegramMessage.my_chat_member.from.first_name;
      userName = payloadTelegramMessage.my_chat_member.chat.username;
      status = payloadTelegramMessage.my_chat_member.new_chat_member.status;
    }
    const messageToChat = `Member ${name} ${userName}, status:${status}.`;
    await this.sendTelegramMessage(Number(bot_chatId), messageToChat);
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
}

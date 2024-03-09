import { CommandBus, ICommandHandler } from '@nestjs/cqrs';
import { TelegramConfig } from '../../../../config/telegram/telegram.config';
import { TelegramMethodsEnum } from '../../enums/telegram-methods.enum';
import { TelegramApiEndpointsEnum } from '../../enums/telegram-api-endpoints.enum';
import { ManageTelegramBotCommand } from './manage-telegram-bot.use-case';
import axios from 'axios';
import { PayloadTelegramMessageType } from '../../types/payload-telegram-message.type';

export class SendMessagesCommand {
  constructor(public payloadTelegram: PayloadTelegramMessageType) {}
}

export class SendMessagesUseCase
  implements ICommandHandler<SendMessagesCommand>
{
  constructor(
    private readonly commandBus: CommandBus,
    private readonly telegramConfig: TelegramConfig,
  ) {}

  async execute(command: SendMessagesCommand) {
    const { payloadTelegram } = command;
    const tokenTelegramBot = await this.telegramConfig.getTokenTelegram(
      'TOKEN_TELEGRAM_IT_INCUBATOR',
    );
    const sendMessage = TelegramMethodsEnum.SEND_MESSAGE;
    const telegramUrl = `${TelegramApiEndpointsEnum.Bot}${tokenTelegramBot}/${sendMessage}`;

    // Check if the message contains a deep link parameter
    const deepLinkParam = this.extractDeepLinkParameter(
      payloadTelegram.message.text,
    );

    if (deepLinkParam) {
      // Process the activation code from the deep link parameter
      const activationCode = this.extractActivationCode(deepLinkParam);

      // Execute the command to manage the Telegram bot with the activation code
      const answerToRecipient: string = await this.commandBus.execute(
        new ManageTelegramBotCommand(payloadTelegram, activationCode),
      );
      const data = {
        chat_id: payloadTelegram.message.from.id,
        text: answerToRecipient,
      };

      // Send a message back to the user
      await axios.post(telegramUrl, data);
    } else {
      // If the deep link parameter is not present, reply with a default message
      await axios.post(telegramUrl, {
        chat_id: payloadTelegram.message.from.id,
        text: 'Invalid activation link. Please try again!',
      });
    }
  }

  // Helper function to extract the deep link parameter from the message
  private extractDeepLinkParameter(message: string): string | null {
    const startIndex = message.indexOf(
      'https://t.me/blogger_platform_bot?code=',
    );
    if (startIndex !== -1) {
      return message.substring(
        startIndex + 'https://t.me/blogger_platform_bot?code='.length,
      );
    }
    return null;
  }

  // Helper function to extract the activation code from the deep link parameter
  private extractActivationCode(deepLinkParam: string): string {
    const codeIndex = deepLinkParam.indexOf('code=');
    if (codeIndex !== -1) {
      return deepLinkParam.substring(codeIndex + 'code='.length);
    }
    return '';
  }
}

// import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
// import axios from 'axios';
// import { TelegramConfig } from '../../../../config/telegram/telegram.config';
// import { PayloadTelegramMessageType } from '../../types/payload-telegram-message.type';
// import { TelegramApiEndpointsEnum } from '../../enums/telegram-api-endpoints.enum';
// import { TelegramMethodsEnum } from '../../enums/telegram-methods.enum';
// import { ManageTelegramBotCommand } from './manage-telegram-bot.use-case';
//
// export class SendMessagesCommand {
//   constructor(public payloadTelegramMessage: PayloadTelegramMessageType) {}
// }
//
// @CommandHandler(SendMessagesCommand)
// export class SendMessagesUseCase
//   implements ICommandHandler<SendMessagesCommand>
// {
//   constructor(
//     private readonly commandBus: CommandBus,
//     private readonly telegramConfig: TelegramConfig,
//   ) {}
//   async execute(command: SendMessagesCommand) {
//     const { payloadTelegramMessage } = command;
//
//     const tokenTelegramBot = await this.telegramConfig.getTokenTelegram(
//       'TOKEN_TELEGRAM_IT_INCUBATOR',
//     );
//
//     const sendMessage = TelegramMethodsEnum.SEND_MESSAGE;
//
//     const telegramUrl = `${TelegramApiEndpointsEnum.Bot}${tokenTelegramBot}/${sendMessage}`;
//
//     const data = {
//       chat_id: payloadTelegramMessage.message.from.id,
//       text: 'not understand you, please try again!',
//     };
//
//     await axios.post(telegramUrl, data);
//
//     // if (payloadTelegramMessage.message.text.includes('/start')) {
//     //   const answerToRecipient: string = await this.commandBus.execute(
//     //     new ManageTelegramBotCommand(payloadTelegramMessage),
//     //   );
//     //   console.log(answerToRecipient, 'answerToRecipient');
//     //   const data = {
//     //     chat_id: payloadTelegramMessage.message.from.id,
//     //     text: answerToRecipient,
//     //   };
//     //
//     //   await axios.post(telegramUrl, data);
//     // } else {
//     //   await axios.post(telegramUrl, {
//     //     chat_id: payloadTelegramMessage.message.from.id,
//     //     text: 'not understand you, please try again!',
//     //   });
//     // }
//
//     // if (payloadTelegramMessage.message.text) {
//     //   const answerToRecipient = await this.commandBus.execute(
//     //     new TelegramTextParserCommand(payloadTelegramMessage),
//     //   );
//     //   const data = {
//     //     chat_id: payloadTelegramMessage.message.from.id,
//     //     text: answerToRecipient,
//     //   };
//     //
//     //   await axios.post(telegramUrl, data);
//     // }
//   }
// }

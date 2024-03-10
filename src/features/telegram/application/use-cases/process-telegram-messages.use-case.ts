import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import axios from 'axios';
import { TelegramConfig } from '../../../../config/telegram/telegram.config';
import { PayloadTelegramMessageType } from '../../types/payload-telegram-message.type';
import { TelegramApiEndpointsEnum } from '../../enums/telegram-api-endpoints.enum';
import { TelegramMethodsEnum } from '../../enums/telegram-methods.enum';
import { ManageTelegramBotCommand } from './manage-telegram-bot.use-case';
import { TelegramTextParserCommand } from './telegram-text-parser.use-case';

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
    const { payloadTelegramMessage } = command;
    const { text } = payloadTelegramMessage.message;

    if (!text) {
      await this.sendDoNotUnderstandYouMessage(payloadTelegramMessage);
      return;
    }

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
    const { first_name } = payloadTelegramMessage.message.from;
    const unknownCommandMessage = `Welcome, ${first_name || 'new user'}! But I do not understand you!`;
    await this.sendTelegramMessage(
      payloadTelegramMessage.message.from.id,
      unknownCommandMessage,
    );
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
    return `${TelegramApiEndpointsEnum.Bot}${tokenTelegramBot}/${sendMessage}`;
  }
}
// @CommandHandler(ProcessTelegramMessagesCommand)
// export class ProcessTelegramMessagesUseCase
//   implements ICommandHandler<ProcessTelegramMessagesCommand>
// {
//   constructor(
//     private readonly commandBus: CommandBus,
//     private readonly telegramConfig: TelegramConfig,
//   ) {}
//
//   async execute(command: ProcessTelegramMessagesCommand) {
//     const { payloadTelegramMessage } = command;
//
//     if (!payloadTelegramMessage.message.text) {
//       await this.sendTelegramMessage(
//         payloadTelegramMessage.message.from.id,
//         'Do not understand you, please try again!',
//       );
//       return;
//     }
//
//     const text: string = payloadTelegramMessage.message.text;
//     console.log(text, 'text');
//
//     if (text) {
//       if (text.startsWith('start') || text.startsWith('/start')) {
//         // If the text starts with '/start' but does not contain 'code=', send a new user welcome message
//         const parts = text.split(' ')[1];
//         console.log(parts, 'parts');
//         if (!parts) {
//           await this.sendNewUserWelcomeMessage(payloadTelegramMessage);
//           return;
//         } else if (parts && !parts.startsWith('code')) {
//           await this.sendUnknownCommandMessage(payloadTelegramMessage, parts);
//           return;
//         }
//
//         // If the text starts with '/start' and contains 'code=', proceed with code extraction and activation
//         const code = await this.extractActivationCode(parts);
//
//         if (code) {
//           console.log(code, 'code');
//           const feedbackMessage: string = await this.commandBus.execute(
//             new ManageTelegramBotCommand(payloadTelegramMessage, code),
//           );
//
//           await this.sendTelegramMessage(
//             payloadTelegramMessage.message.from.id,
//             feedbackMessage,
//           );
//           return;
//         }
//       }
//       // If the text does not start with '/start', or does not contain 'code='  'code', execute TelegramTextParserCommand
//       const feedbackMessage = await this.commandBus.execute(
//         new TelegramTextParserCommand(payloadTelegramMessage),
//       );
//       await this.sendTelegramMessage(
//         payloadTelegramMessage.message.from.id,
//         feedbackMessage,
//       );
//     }
//   }
//
//   // Helper function to send a message via Telegram
//   private async sendTelegramMessage(
//     chatId: number,
//     text: string,
//   ): Promise<void> {
//     const telegramUrl = await this.getTelegramUrl();
//     const data = { chat_id: chatId, text };
//     await axios.post(telegramUrl, data);
//   }
//
//   // Helper function to send a new user welcome message
//   private async sendNewUserWelcomeMessage(
//     payloadTelegramMessage: PayloadTelegramMessageType,
//   ): Promise<void> {
//     const firstName =
//       payloadTelegramMessage.message.from.first_name || 'new user';
//     const welcomeMessage = `Welcome, ${firstName}!`;
//
//     await this.sendTelegramMessage(
//       payloadTelegramMessage.message.from.id,
//       welcomeMessage,
//     );
//   }
//
//   private async sendUnknownCommandMessage(
//     payloadTelegramMessage: PayloadTelegramMessageType,
//     parts: string,
//   ): Promise<void> {
//     const firstName =
//       payloadTelegramMessage.message.from.first_name || 'new user';
//     const unknownCommandMessage = `Welcome, ${firstName}! But I do not understand the command: ${parts}!`;
//
//     await this.sendTelegramMessage(
//       payloadTelegramMessage.message.from.id,
//       unknownCommandMessage,
//     );
//   }
//
//   private async extractActivationCode(message: string): Promise<string | null> {
//     const codeIndex = message.indexOf('code=');
//
//     // If 'code=' is found in the message
//     if (codeIndex !== -1) {
//       return message.substring(codeIndex + 5);
//     }
//
//     const codeWithoutEqualIndex = message.indexOf('code');
//
//     // If 'code' is found in the message
//     if (codeWithoutEqualIndex !== -1) {
//       return message.substring(codeWithoutEqualIndex + 4);
//     }
//
//     return null; // Return null if neither 'code=' nor 'code' is found in the message
//   }
//
//   // Helper function to get the Telegram API URL
//   private async getTelegramUrl(): Promise<string> {
//     const tokenTelegramBot = await this.telegramConfig.getTokenTelegram(
//       'TOKEN_TELEGRAM_IT_INCUBATOR',
//     );
//     const sendMessage = TelegramMethodsEnum.SEND_MESSAGE;
//     return `${TelegramApiEndpointsEnum.Bot}${tokenTelegramBot}/${sendMessage}`;
//   }
//
//   // private async extractActivationCode(message: string): Promise<string | null> {
//   //   // Find the index of the word 'code' in the message
//   //   const codeIndex = message.indexOf('code');
//   //
//   //   // If 'code' is found in the message
//   //   if (codeIndex !== -1) {
//   //     // Extract the substring starting from 'code' until the end of the message
//   //     return message.substring(codeIndex);
//   //   }
//   //
//   //   return null; // Return null if 'code' is not found in the message
//   // }
//
//   // // Helper function to extract the activation code
//   // private async extractActivationCode(message: string): Promise<string | null> {
//   //   if (message.includes('code=')) {
//   //     const parts = message.split(' ');
//   //     for (const part of parts) {
//   //       if (part.includes('code=')) {
//   //         return part.split('=')[1];
//   //       }
//   //     }
//   //   }
//   //   return null;
//   // }
// }

import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TelegramConfig } from '../../../../config/telegram/telegram.config';
import { TelegramMethodsEnum } from '../../enums/telegram-methods.enum';
import { TelegramApiEndpointsEnum } from '../../enums/telegram-api-endpoints.enum';
import { ManageTelegramBotCommand } from './manage-telegram-bot.use-case';
import axios from 'axios';
import { PayloadTelegramMessageType } from '../../types/payload-telegram-message.type';

export class SendMessagesCommand {
  constructor(public payloadTelegram: PayloadTelegramMessageType) {}
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
    const { payloadTelegram } = command;

    // const text = payloadTelegram.message.text;
    const tokenTelegramBot = await this.telegramConfig.getTokenTelegram(
      'TOKEN_TELEGRAM_IT_INCUBATOR',
    );
    const sendMessage = TelegramMethodsEnum.SEND_MESSAGE;
    const telegramUrl = `${TelegramApiEndpointsEnum.Bot}${tokenTelegramBot}/${sendMessage}`;

    const data = {
      chat_id: payloadTelegram.message.from.id,
      text: 'answer to recipient',
    };

    // Send a message back to the user
    await axios.post(telegramUrl, data);

    //   const usernameBot = await this.telegramConfig.getUsernameBotTelegram(
    //     'TELEGRAM_USERNAME_BOT',
    //   );
    //   const telegramBaseURL = `https://t.me/${usernameBot}`;
    //
    //   // Check if the message contains a deep link parameter
    //   const deepLinkParam = this.extractParameters(telegramBaseURL, text);
    //
    //   if (deepLinkParam && deepLinkParam['code']) {
    //     // Process the activation code from the deep link parameter
    //     const activationCode = deepLinkParam['code'];
    //
    //     // Execute the command to manage the Telegram bot with the activation code
    //     const answerToRecipient: string = await this.commandBus.execute(
    //       new ManageTelegramBotCommand(payloadTelegram, activationCode),
    //     );
    //     const data = {
    //       chat_id: payloadTelegram.message.from.id,
    //       text: answerToRecipient,
    //     };
    //
    //     // Send a message back to the user
    //     await axios.post(telegramUrl, data);
    //   } else {
    //     // If the deep link parameter is not present or if activation code is not found, reply with a default message
    //     await axios.post(telegramUrl, {
    //       chat_id: payloadTelegram.message.from.id,
    //       text: 'Invalid activation link. Please try again!',
    //     });
    //   }
    // }
    //
    // // Helper function to extract all parameters and their values from the URL string
    // private extractParameters(
    //   botLink: string,
    //   text: string,
    // ): { [key: string]: string } {
    //   const parameters: { [key: string]: string } = {};
    //
    //   // Check if the text contains the bot link
    //   if (text.includes(botLink)) {
    //     // Find the index of the parameters start after the '?' symbol
    //     const paramsStartIndex = text.indexOf('?');
    //     if (paramsStartIndex !== -1) {
    //       // Extract the substring containing parameters
    //       const paramsString = text.substring(paramsStartIndex + 1);
    //
    //       // Split the parameters string by '&' to separate individual parameters
    //       const parameterPairs = paramsString.split('&');
    //
    //       // Iterate over each parameter pair
    //       parameterPairs.forEach((pair) => {
    //         // Split the parameter pair by '=' to separate parameter name and value
    //         const [name, value] = pair.split('=');
    //
    //         // Store the parameter name and value in the parameters object
    //         parameters[name] = value;
    //       });
    //     }
    //   }
    //
    //   return parameters;
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

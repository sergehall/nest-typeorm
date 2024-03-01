import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PayloadTelegramMessageType } from '../../types/payload-telegram-message.type';

export class TelegramTextParserCommand {
  constructor(public payloadTelegramMessage: PayloadTelegramMessageType) {}
}

@CommandHandler(TelegramTextParserCommand)
export class TelegramTextParserUseCase
  implements ICommandHandler<TelegramTextParserCommand>
{
  constructor() {}

  async execute(command: TelegramTextParserCommand): Promise<string> {
    const { payloadTelegramMessage } = command;
    const commonWords = ['how', 'is', 'the', 'and', 'what'];
    const nameRecipient =
      payloadTelegramMessage.message.from.first_name ||
      payloadTelegramMessage.message.from.username;

    const words = payloadTelegramMessage.message.text
      .toLowerCase()
      .split(' ')
      .filter((word) => !commonWords.includes(word));

    // Check if the input contains the word "hello"
    if (words.includes('hello')) {
      return `Hello ${nameRecipient}! How are you today?`;
    }

    // Analyze the other words and create a response
    let response = '';
    for (const word of words) {
      switch (word) {
        case 'goodbye':
          response += `Goodbye ${nameRecipient}! Have a great day! `;
          break;
        case 'help':
          response += "Sure, I'm here to assist you! ";
          break;
        case 'weather':
          response += 'The weather is sunny and warm today. ';
          break;
        case 'time':
          const time = new Date().toISOString();
          response += `The current ${time}. `;
          break;
        case 'mood':
          response += "I'm feeling great today, thank you for asking! ";
          break;
        default:
          response += `I\'m not sure  ${nameRecipient} what you mean by "' + ${word} + '". `;
          break;
      }
    }

    return response.trim();
  }
}

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

    const nameRecipient =
      payloadTelegramMessage.message.from.first_name ||
      payloadTelegramMessage.message.from.username;

    const text = payloadTelegramMessage.message.text;

    const commonWords = ['how', 'is', 'the', 'and', 'what'];
    // Split the input string into words, including punctuation marks as separate entities
    const words: string[] = text.toLowerCase().match(/\w+|[^\w\s]/g) || [];

    // Check if the input contains the word "hello"
    if (words.length != 0 && words.includes('hello')) {
      return `Hello, ${nameRecipient}! How are you today?`;
    }

    // Analyze the other words and create a response
    let response = '';
    for (const word of words) {
      if (!commonWords.includes(word)) {
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
            // Check if the word is not punctuation
            if (word.match(/\w/)) {
              response += `I'm not sure what you mean by "${word}", ${nameRecipient}. `;
            }
            break;
        }
      }
    }

    return response.trim();
  }
}

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

  async execute({
    payloadTelegramMessage,
  }: TelegramTextParserCommand): Promise<string> {
    const nameRecipient =
      payloadTelegramMessage.message.from.first_name ||
      payloadTelegramMessage.message.from.username;

    const text = payloadTelegramMessage.message.text;

    const commonWords = ['how', 'is', 'the', 'and', 'what'];
    // Split the input string into words, including punctuation marks as separate entities
    const words: string[] = text.toLowerCase().match(/\w+|[^\w\s]/g) || [];

    // Check if the input contains the word "hello"
    if (words.length !== 0 && words.includes('hello')) {
      return `Hello, ${nameRecipient}! How are you today?`;
    }

    // Analyze the other words and create a response
    let response: string = '';
    const incomprehensibleWords: string[] = [];
    for (const word of words) {
      if (!commonWords.includes(word)) {
        incomprehensibleWords.push(word);
        switch (word) {
          case 'goodbye':
            response += `Goodbye, ${nameRecipient}! Have a great day! `;
            break;
          case 'help':
            response += `Sure, I'm here to assist you! `;
            break;
          case 'weather':
            response += 'The weather is sunny and warm today. ';
            break;
          case 'time':
            const time = new Date().toTimeString();
            response += `The current ${time}. `;
            break;
          case 'mood':
            response += `I'm feeling great today, thank you for asking! `;
            break;
          default:
            // Check if the word is not punctuation
            if (word.match(/\w/)) {
              response += `I'm not sure what you mean by "${incomprehensibleWords}", ${nameRecipient}. `;
            }
            break;
        }
      }
    }
    const answer = await this.generateResponse(
      response,
      incomprehensibleWords,
      nameRecipient,
    );

    return answer;
  }

  private async generateResponse(
    response: string,
    incomprehensibleWords: string[],
    nameRecipient: string,
  ): Promise<string> {
    for (const word of incomprehensibleWords) {
      response += `I'm not sure what you mean by "${word}", ${nameRecipient}. `;
    }
    return response.trim();
  }
}

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class TelegramTextParserCommand {
  constructor(public text: string) {}
}

@CommandHandler(TelegramTextParserCommand)
export class TelegramTextParserUseCase
  implements ICommandHandler<TelegramTextParserCommand>
{
  constructor() {}

  async execute(command: TelegramTextParserCommand): Promise<string> {
    const { text } = command;
    const commonWords = ['how', 'is', 'the', 'and', 'what'];
    const words = text
      .toLowerCase()
      .split(' ')
      .filter((word) => !commonWords.includes(word));

    // Check if the input contains the word "hello"
    if (words.includes('hello')) {
      return 'Hello! How are you today?';
    }

    // Analyze the other words and create a response
    let response = '';
    for (const word of words) {
      switch (word) {
        case 'goodbye':
          response += 'Goodbye! Have a great day! ';
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
          response += 'I\'m not sure what you mean by "' + word + '". ';
          break;
      }
    }

    return response.trim();
  }
}

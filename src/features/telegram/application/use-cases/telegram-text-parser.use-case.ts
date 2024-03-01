import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PayloadTelegramMessageType } from '../../types/payload-telegram-message.type';
import { dialogSets } from '../../dialog/sets';
import { Trie } from '../../helpers/self-trie';

export class TelegramTextParserCommand {
  constructor(public payloadTelegramMessage: PayloadTelegramMessageType) {}
}

@CommandHandler(TelegramTextParserCommand)
export class TelegramTextParserUseCase
  implements ICommandHandler<TelegramTextParserCommand>
{
  private trie: Trie<string>;

  constructor() {
    this.trie = new Trie<string>();
    // Наполняем Trie ключами и ответами из dialogSets
    for (const [responses, response] of dialogSets) {
      for (const word of responses) {
        if (typeof response === 'string') {
          this.trie.insert(word.toLowerCase(), response);
        }
      }
    }
  }

  async execute({
    payloadTelegramMessage,
  }: TelegramTextParserCommand): Promise<string> {
    const text = payloadTelegramMessage.message.text.toLowerCase();
    const nameRecipient =
      payloadTelegramMessage.message.from.first_name ||
      payloadTelegramMessage.message.from.username;

    const response = this.processString(text);
    if (response) {
      return response.replace('{nameRecipient}', nameRecipient);
    } else {
      return `I'm not sure what you mean, ${nameRecipient}.`;
    }
  }

  private processString(text: string): string | undefined {
    const words = text.split(/[ ,]+/);
    for (const word of words) {
      const response = this.trie.search(word);
      if (response) {
        return response; // Возвращаем ответ, соответствующий найденному ключу
      }
    }
    return undefined;
  }
}

// @CommandHandler(TelegramTextParserCommand)
// export class TelegramTextParserUseCase
//   implements ICommandHandler<TelegramTextParserCommand>
// {
//   constructor() {}
//
//   async execute({
//     payloadTelegramMessage,
//   }: TelegramTextParserCommand): Promise<string> {
//     return await this.processString(payloadTelegramMessage, dialogSets);
//   }
//
//   private async processString(
//     payloadTelegramMessage: PayloadTelegramMessageType,
//     dialogSets: DialogSets,
//   ) {
//     const text = payloadTelegramMessage.message.text;
//
//     const nameRecipient =
//       payloadTelegramMessage.message.from.first_name ||
//       payloadTelegramMessage.message.from.username;
//
//     const trie = new Trie<string>(); // Specify the type of Trie
//     for (const [responses] of dialogSets) {
//       for (const response of responses) {
//         trie.insert(response.toLowerCase(), response); // Insert response as both key and value
//       }
//     }
//
//     const words = text.toLowerCase().split(/[ ,]+/);
//     for (const word of words) {
//       const node = trie.searchPrefix(word);
//       if (node && node.value) {
//         // Check if the node has a value
//         switch (node.value) {
//           case 'hello':
//             return `Hello, ${nameRecipient}! How are you today?`;
//           case 'time':
//             return `The current ${new Date().toTimeString()}.`;
//           case 'mood':
//             return `I'm feeling great today, thank you for asking!`;
//           case 'weather':
//             return `The weather is currently sunny.`;
//           case 'good morning':
//             return `Good morning, ${nameRecipient}!`;
//           case 'good evening':
//             return `Good evening, ${nameRecipient}!`;
//           case 'how are you doing':
//             return `I'm doing well, thank you for asking, ${nameRecipient}.`;
//           case 'thank you':
//             return `You're welcome, ${nameRecipient}!`;
//           case 'goodbye':
//             return `Goodbye, ${nameRecipient}! Take care.`;
//           case "what's new":
//             return `Nothing much is new, ${nameRecipient}.`;
//           case "how's work":
//             return `Work is going fine, ${nameRecipient}.`;
//           case "how's family":
//             return `Family is doing well, ${nameRecipient}.`;
//           case "how's school":
//             return `School is going well, ${nameRecipient}.`;
//           case "what's for dinner":
//             return `I'm not sure yet, ${nameRecipient}.`;
//           case "how's your day":
//             return `My day is going well, ${nameRecipient}.`;
//           default:
//             return `I'm not sure what you mean, ${nameRecipient}.`;
//         }
//       }
//     }
//     return `I'm not sure what you mean, ${nameRecipient}.`;
//   }
// }

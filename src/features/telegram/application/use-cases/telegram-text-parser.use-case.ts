import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PayloadTelegramMessageType } from '../../types/payload-telegram-message.type';
import { Trie } from '../../helpers/self-trie';
import { DialogTrieInitializer } from '../../helpers/dialog-trie-initializer';

export class TelegramTextParserCommand {
  constructor(public payloadTelegramMessage: PayloadTelegramMessageType) {}
}

@CommandHandler(TelegramTextParserCommand)
export class TelegramTextParserUseCase
  implements ICommandHandler<TelegramTextParserCommand>
{
  private trie: Trie<string>;
  private similarityThreshold = 0.5; // Adjust similarity threshold as needed

  constructor() {
    this.trie = DialogTrieInitializer.initializeTrie();
  }

  async execute({
    payloadTelegramMessage,
  }: TelegramTextParserCommand): Promise<string> {
    const text = payloadTelegramMessage.message.text.toLowerCase();
    const nameRecipient =
      payloadTelegramMessage.message.from.first_name ||
      payloadTelegramMessage.message.from.username;

    const response = await this.processString(text);
    if (response) {
      return response.replace('{nameRecipient}', nameRecipient);
    } else {
      return `I'm not sure what you mean, ${nameRecipient}.`;
    }
  }

  private async processString(text: string): Promise<string | undefined> {
    const words = text.split(/[ ,]+/);
    let maxSimilarity = 0;
    let bestResponse: string | undefined;

    for (const word of words) {
      const response = this.trie.searchPrefix(word.toLowerCase());
      if (response) {
        const similarity = await this.calculateJaccardSimilarity(
          words,
          response.split(/[ ,]+/),
        );
        if (similarity > maxSimilarity) {
          maxSimilarity = similarity;
          bestResponse = response;
        }
      }
    }

    if (maxSimilarity >= this.similarityThreshold && bestResponse) {
      return bestResponse;
    }

    return undefined;
  }

  private async calculateJaccardSimilarity(
    words1: string[],
    words2: string[],
  ): Promise<number> {
    const set1 = new Set(words1);
    const set2 = new Set(words2);
    const intersection = new Set([...set1].filter((x) => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return intersection.size / union.size;
  }
}

// @CommandHandler(TelegramTextParserCommand)
// export class TelegramTextParserUseCase
//   implements ICommandHandler<TelegramTextParserCommand>
// {
//   private trie: Trie<string>;
//   private similarityThreshold = 0.8; // Similarity threshold
//
//   constructor() {
//     this.trie = DialogTrieInitializer.initializeTrie(dialogsSets);
//   }
//
//   async execute({
//     payloadTelegramMessage,
//   }: TelegramTextParserCommand): Promise<string> {
//     const text = payloadTelegramMessage.message.text.toLowerCase();
//     const nameRecipient =
//       payloadTelegramMessage.message.from.first_name ||
//       payloadTelegramMessage.message.from.username;
//
//     const response = this.processString(text);
//     if (response) {
//       return response.replace('{nameRecipient}', nameRecipient);
//     } else {
//       return `I'm not sure what you mean, ${nameRecipient}.`;
//     }
//   }
//
//   private processString(text: string): string | undefined {
//     const words = text.split(/[ ,]+/);
//     let maxSimilarity = 0;
//     let bestResponse: string | undefined;
//
//     for (const [responses, response] of dialogsSets) {
//       for (let i = 0; i < responses.length; i++) {
//         const phrase = responses[i].toLowerCase();
//         const similarity = this.calculateJaccardSimilarity(
//           words,
//           phrase.split(/[ ,]+/),
//         );
//         if (similarity > maxSimilarity) {
//           maxSimilarity = similarity;
//           bestResponse = response;
//         }
//       }
//     }
//
//     if (maxSimilarity >= this.similarityThreshold && bestResponse) {
//       return bestResponse;
//     }
//
//     return undefined;
//   }
//
//   private calculateJaccardSimilarity(
//     words1: string[],
//     words2: string[],
//   ): number {
//     const set1 = new Set(words1);
//     const set2 = new Set(words2);
//     const intersection = new Set([...set1].filter((x) => set2.has(x)));
//     const union = new Set([...set1, ...set2]);
//     return intersection.size / union.size;
//   }
// }

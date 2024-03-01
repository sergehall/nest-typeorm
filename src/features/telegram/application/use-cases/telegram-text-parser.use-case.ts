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

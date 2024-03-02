import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PayloadTelegramMessageType } from '../../types/payload-telegram-message.type';
import * as similarity from 'similarity';
import { dialogsSets, DialogTemplate } from '../../helpers/dialogs-sets';

export class TelegramTextParserCommand {
  constructor(public payloadTelegramMessage: PayloadTelegramMessageType) {}
}

@CommandHandler(TelegramTextParserCommand)
export class TelegramTextParserUseCase
  implements ICommandHandler<TelegramTextParserCommand>
{
  async execute({
    payloadTelegramMessage,
  }: TelegramTextParserCommand): Promise<string> {
    const inputPhrase = payloadTelegramMessage.message.text.toLowerCase();
    const nameRecipient =
      payloadTelegramMessage.message.from.first_name ||
      payloadTelegramMessage.message.from.username;

    let bestMatch: DialogTemplate | undefined;
    let highestSimilarity = -1; // Initialize to a lower value

    dialogsSets.forEach((template) => {
      template.variations.forEach((variation) => {
        const similarityScore = similarity(variation, inputPhrase);
        if (similarityScore > highestSimilarity) {
          bestMatch = template;
          highestSimilarity = similarityScore;
        }
      });
    });

    if (bestMatch && highestSimilarity >= 0.9) {
      console.log({ id: bestMatch.id, response: bestMatch.response });
      return bestMatch.response;
    } else {
      // Handle the case where no match is found
      return `I'm not sure what you mean, ${nameRecipient}.`;
    }
  }
}

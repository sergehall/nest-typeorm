import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PayloadTelegramMessageType } from '../../types/payload-telegram-message.type';
import { dialogsSets, DialogTemplate } from '../../helpers/dialogs-sets';
import similarity from 'string-similarity-js';

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
    // Extract message text and recipient's name from the payload
    const inputPhrase = payloadTelegramMessage.message.text.toLowerCase();
    const nameRecipient =
      payloadTelegramMessage.message.from.first_name ||
      payloadTelegramMessage.message.from.username;

    let bestMatch: DialogTemplate | undefined;
    let highestSimilarity = -1; // Initialize to a lower value

    // Perform parallel processing for each template
    await Promise.all(
      dialogsSets.map(async (template) => {
        // Compute similarity scores concurrently for each variation
        const similarityPromises = template.variations.map((variation) =>
          similarity(variation, inputPhrase),
        );
        const similarityScores = await Promise.all(similarityPromises);

        // Find the maximum similarity score and corresponding template
        const maxSimilarity = Math.max(...similarityScores);
        if (maxSimilarity > highestSimilarity) {
          // Update the best match if the current template has higher similarity
          bestMatch = template;
          highestSimilarity = maxSimilarity;
        }
      }),
    );

    if (bestMatch && highestSimilarity >= 0.9) {
      // Check if {nameRecipient} exists in the response and replace if necessary
      return bestMatch.response.includes('{nameRecipient}')
        ? bestMatch.response.replace('{nameRecipient}', nameRecipient)
        : bestMatch.response;
    } else {
      // Handle the case where no match is found
      return `I'm not sure what you mean, ${nameRecipient}.`;
    }
  }
}

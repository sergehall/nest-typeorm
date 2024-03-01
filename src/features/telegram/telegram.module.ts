import { Module } from '@nestjs/common';
import { TelegramService } from './application/telegram.service';
import { TelegramController } from './api/telegram.controller';
import { TelegramAdapter } from '../../adapters/telegram/telegram.adapter';
import { PostgresConfig } from '../../config/db/postgres/postgres.config';
import { TelegramConfig } from '../../config/telegram/telegram.config';
import { CqrsModule } from '@nestjs/cqrs';
import { SendOurWebhookToTelegramUseCase } from './application/use-cases/send-our-webhook-to-telegram.use-case';
import { SendMessageToRecipientUseCase } from './application/use-cases/send-message-to-recipient.use-case';
import { TelegramTextParserUseCase } from './application/use-cases/telegram-text-parser.use-case';
import { LevenshteinDistance } from './helpers/levenshtein-distance';

const telegramUseCases = [
  SendOurWebhookToTelegramUseCase,
  SendMessageToRecipientUseCase,
  TelegramTextParserUseCase,
];

@Module({
  imports: [CqrsModule],
  controllers: [TelegramController],
  providers: [
    PostgresConfig,
    TelegramConfig,
    TelegramService,
    TelegramAdapter,
    LevenshteinDistance,
    ...telegramUseCases,
  ],
})
export class TelegramModule {}

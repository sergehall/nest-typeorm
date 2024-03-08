import { Module } from '@nestjs/common';
import { TelegramService } from './application/telegram.service';
import { TelegramController } from './api/telegram.controller';
import { TelegramAdapter } from '../../adapters/telegram/telegram.adapter';
import { PostgresConfig } from '../../config/db/postgres/postgres.config';
import { TelegramConfig } from '../../config/telegram/telegram.config';
import { CqrsModule } from '@nestjs/cqrs';
import { SendOurWebhookToTelegramUseCase } from './application/use-cases/send-our-webhook-to-telegram.use-case';
import { SendMessagesUseCase } from './application/use-cases/send-messages.use-case';
import { TelegramTextParserUseCase } from './application/use-cases/telegram-text-parser.use-case';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelegramBotStatusEntity } from './entities/telegram-bot-status.entity';
import { GenerateTelegramActivationLinkUseCase } from './application/use-cases/generate-telegram-activation-code.use-case';

const telegramUseCases = [
  SendOurWebhookToTelegramUseCase,
  SendMessagesUseCase,
  TelegramTextParserUseCase,
  GenerateTelegramActivationLinkUseCase,
];

@Module({
  imports: [TypeOrmModule.forFeature([TelegramBotStatusEntity]), CqrsModule],

  controllers: [TelegramController],
  providers: [
    PostgresConfig,
    TelegramConfig,
    TelegramService,
    TelegramAdapter,
    ...telegramUseCases,
  ],
})
export class TelegramModule {}

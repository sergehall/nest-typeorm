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
import { ActivateTelegramBotUseCase } from './application/use-cases/activate-telegram-bot.use-case';
import { UsersRepo } from '../users/infrastructure/users-repo';
import { UsersEntity } from '../users/entities/users.entity';
import { KeyResolver } from '../../common/helpers/key-resolver';
import { UuidErrorResolver } from '../../common/helpers/uuid-error-resolver';
import { GamePairsRepo } from '../pair-game-quiz/infrastructure/game-pairs.repo';
import { PairsGameEntity } from '../pair-game-quiz/entities/pairs-game.entity';
import { ChallengeQuestionsEntity } from '../pair-game-quiz/entities/challenge-questions.entity';
import { ChallengesQuestionsRepo } from '../pair-game-quiz/infrastructure/challenges-questions.repo';
import { GameQuestionsRepo } from '../pair-game-quiz/infrastructure/game-questions.repo';
import { QuestionsQuizEntity } from '../sa-quiz-questions/entities/questions-quiz.entity';

const telegramUseCases = [
  SendOurWebhookToTelegramUseCase,
  SendMessagesUseCase,
  TelegramTextParserUseCase,
  GenerateTelegramActivationLinkUseCase,
  ActivateTelegramBotUseCase,
];

const helpers = [KeyResolver, UuidErrorResolver];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsersEntity,
      PairsGameEntity,
      QuestionsQuizEntity,
      TelegramBotStatusEntity,
      ChallengeQuestionsEntity,
    ]),
    CqrsModule,
  ],

  controllers: [TelegramController],
  providers: [
    PostgresConfig,
    TelegramConfig,
    TelegramService,
    TelegramAdapter,
    UsersRepo,
    GamePairsRepo,
    GameQuestionsRepo,
    ChallengesQuestionsRepo,
    ...telegramUseCases,
    ...helpers,
  ],
})
export class TelegramModule {}

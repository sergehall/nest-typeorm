import { Module } from '@nestjs/common';
import { TelegramService } from './application/telegram.service';
import { TelegramController } from './api/telegram.controller';
import { PostgresConfig } from '../../config/db/postgres/postgres.config';
import { TelegramConfig } from '../../config/telegram/telegram.config';
import { CqrsModule } from '@nestjs/cqrs';
import { SendOurWebhookToTelegramUseCase } from './application/use-cases/send-our-webhook-to-telegram.use-case';
import { TelegramTextParserUseCase } from './application/use-cases/telegram-text-parser.use-case';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelegramBotStatusEntity } from './entities/telegram-bot-status.entity';
import { GenerateTelegramActivationLinkUseCase } from './application/use-cases/generate-telegram-activation-code.use-case';
import { ManageTelegramBotUseCase } from './application/use-cases/manage-telegram-bot.use-case';
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
import { TelegramBotStatusRepo } from './infrastructure/telegram-bot-status.repo';
import { ProcessTelegramWebhookMessagesUseCase } from './application/use-cases/process-telegram-webhook-messages.use-case';
import { SendNewBlogPostNotificationsUseCase } from './application/use-cases/send-new-blog-post-notifications.use-case';
import { BlogsSubscribersRepo } from '../blogger-blogs/infrastructure/blogs-subscribers.repo';
import { BlogsSubscribersEntity } from '../blogger-blogs/entities/blogs-subscribers.entity';
import { TelegramAdapter } from '../../adapters/telegram/telegram.adapter';

const telegramUseCases = [
  SendOurWebhookToTelegramUseCase,
  ProcessTelegramWebhookMessagesUseCase,
  TelegramTextParserUseCase,
  GenerateTelegramActivationLinkUseCase,
  ManageTelegramBotUseCase,
  SendNewBlogPostNotificationsUseCase,
];

const helpers = [KeyResolver, UuidErrorResolver];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsersEntity,
      PairsGameEntity,
      QuestionsQuizEntity,
      BlogsSubscribersEntity,
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
    BlogsSubscribersRepo,
    TelegramBotStatusRepo,
    ChallengesQuestionsRepo,
    ...telegramUseCases,
    ...helpers,
  ],
})
export class TelegramModule {}

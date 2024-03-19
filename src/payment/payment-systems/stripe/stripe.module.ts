import { Module } from '@nestjs/common';
import { StripeController } from './api/stripe.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { ProcessStripeWebHookUseCase } from './application/use-cases/process-stripe-webhook.use-case';
import { StripeAdapter } from './adapter/stripe-adapter';
import { BuyWithStripeUseCase } from './application/use-cases/buy-with-stripe.use-case';
import { StripeService } from './application/stripe.service';
import { ProductsDataEntity } from '../../../common/products/entities/products-data.entity';
import { StripeFactory } from '../../../config/stripe/stripe-factory';
import { NodeEnvConfig } from '../../../config/node-env/node-env.config';
import { PostgresConfig } from '../../../config/db/postgres/postgres.config';
import { StripeConfig } from '../../../config/stripe/stripe.config';
import { PaymentManager } from '../../payment-manager/payment-manager';
import { ParseQueriesService } from '../../../common/query/parse-queries.service';
import { ProductsRepo } from '../../../common/products/infrastructure/products.repo';
import { InvalidJwtRepo } from '../../../features/auth/infrastructure/invalid-jwt-repo';
import { InvalidJwtEntity } from '../../../features/auth/entities/invalid-jwt.entity';
import { UsersRepo } from '../../../features/users/infrastructure/users-repo';
import { UsersEntity } from '../../../features/users/entities/users.entity';
import { KeyResolver } from '../../../common/helpers/key-resolver';
import { UuidErrorResolver } from '../../../common/helpers/uuid-error-resolver';
import { GamePairsRepo } from '../../../features/pair-game-quiz/infrastructure/game-pairs.repo';
import { PairsGameEntity } from '../../../features/pair-game-quiz/entities/pairs-game.entity';
import { ChallengeQuestionsEntity } from '../../../features/pair-game-quiz/entities/challenge-questions.entity';
import { ChallengesQuestionsRepo } from '../../../features/pair-game-quiz/infrastructure/challenges-questions.repo';
import { GameQuestionsRepo } from '../../../features/pair-game-quiz/infrastructure/game-questions.repo';
import { QuestionsQuizEntity } from '../../../features/sa-quiz-questions/entities/questions-quiz.entity';
import { GuestUsersRepo } from '../../../features/users/infrastructure/guest-users.repo';
import { GuestUsersEntity } from '../../../common/products/entities/unregistered-users.entity';
import { ConstructStripeEventUseCase } from './application/use-cases/construct-stripe-event.use-case';

const stripeUseCases = [
  ConstructStripeEventUseCase,
  BuyWithStripeUseCase,
  ProcessStripeWebHookUseCase,
];
const helpers = [KeyResolver, UuidErrorResolver];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsersEntity,
      GuestUsersEntity,
      ProductsDataEntity,
      InvalidJwtEntity,
      PairsGameEntity,
      QuestionsQuizEntity,
      ChallengeQuestionsEntity,
    ]),
    CqrsModule,
  ],
  controllers: [StripeController],
  providers: [
    StripeFactory,
    NodeEnvConfig,
    PostgresConfig,
    StripeConfig,
    PaymentManager,
    StripeAdapter,
    StripeService,
    ParseQueriesService,
    UsersRepo,
    GuestUsersRepo,
    InvalidJwtRepo,
    ProductsRepo,
    GamePairsRepo,
    GameQuestionsRepo,
    ChallengesQuestionsRepo,
    ...stripeUseCases,
    ...helpers,
  ],
})
export class StripeModule {}

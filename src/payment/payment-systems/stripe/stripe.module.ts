import { Module } from '@nestjs/common';
import { StripeController } from './api/stripe.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { ProcessStripeWebHookUseCase } from './application/use-cases/process-stripe-webhook.use-case';
import { StripeAdapter } from './adapter/stripe-adapter';
import { StripeFactory } from '../../../config/stripe/stripe-factory';
import { NodeEnvConfig } from '../../../config/node-env/node-env.config';
import { PostgresConfig } from '../../../config/db/postgres/postgres.config';
import { StripeConfig } from '../../../config/stripe/stripe.config';
import { PaymentManager } from '../../payment-manager/payment-manager';
import { ParseQueriesService } from '../../../common/query/parse-queries.service';
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
import { ConstructStripeEventUseCase } from './application/use-cases/construct-stripe-event.use-case';
import { ProcessStripeSuccessUseCase } from './application/use-cases/process-stripe-success.use-case';
import { ProcessStripeChargeSucceededUseCase } from './application/use-cases/process-stripe-charge-succeeded.use-case';
import { PaymentTransactionsRepo } from '../../infrastructure/payment-transactions.repo';
import { GuestUsersEntity } from '../../../features/products/entities/unregistered-users.entity';
import { PaymentTransactionsEntity } from '../../../features/products/entities/payment-transaction.entity';
import { ProductsDataEntity } from '../../../features/products/entities/products-data.entity';
import { ProductsRepo } from '../../../features/products/infrastructure/products.repo';
import { OrdersRepo } from '../../../features/products/infrastructure/orders.repo';
import { OrdersEntity } from '../../../features/products/entities/orders.entity';
import { FinalizeOrderPaymentUseCase } from './application/use-cases/finalize-order-payment.use-case';

const stripeUseCases = [
  ConstructStripeEventUseCase,
  ProcessStripeSuccessUseCase,
  ProcessStripeChargeSucceededUseCase,
  ProcessStripeWebHookUseCase,
  FinalizeOrderPaymentUseCase,
];
const helpers = [KeyResolver, UuidErrorResolver];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsersEntity,
      OrdersEntity,
      GuestUsersEntity,
      ProductsDataEntity,
      InvalidJwtEntity,
      PairsGameEntity,
      QuestionsQuizEntity,
      PaymentTransactionsEntity,
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
    ParseQueriesService,
    OrdersRepo,
    UsersRepo,
    GuestUsersRepo,
    InvalidJwtRepo,
    ProductsRepo,
    GamePairsRepo,
    GameQuestionsRepo,
    PaymentTransactionsRepo,
    ChallengesQuestionsRepo,
    ...stripeUseCases,
    ...helpers,
  ],
})
export class StripeModule {}

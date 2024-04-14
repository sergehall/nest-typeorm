import { Module } from '@nestjs/common';
import { StripeController } from './api/stripe.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { ProcessStripeWebHookUseCase } from './application/use-cases/process-stripe-webhook.use-case';
import { StripeAdapter } from './adapter/stripe-adapter';
import { ConstructStripeEventUseCase } from './application/use-cases/construct-stripe-event.use-case';
import { ProcessStripeSuccessUseCase } from './application/use-cases/process-stripe-success.use-case';
import { ProcessStripeChargeSucceededUseCase } from './application/use-cases/process-stripe-charge-succeeded.use-case';
import { FinalizeStripePaymentUseCase } from './application/use-cases/finalize-stripe-payment.use-case';
import { PayPalAdapter } from '../pay-pal/adapter/pay-pal.adapter';
import { PaymentService } from '../../application/payment.service';
import { PaymentManager } from '../../payment-manager/payment-manager';
import { PaymentTransactionsRepo } from '../../infrastructure/payment-transactions.repo';
import { KeyResolver } from '../../../common/helpers/key-resolver';
import { UuidErrorResolver } from '../../../common/helpers/uuid-error-resolver';
import { UsersEntity } from '../../../features/users/entities/users.entity';
import { OrdersEntity } from '../../../features/products/entities/orders.entity';
import { GuestUsersEntity } from '../../../features/products/entities/unregistered-users.entity';
import { ProductsDataEntity } from '../../../features/products/entities/products-data.entity';
import { InvalidJwtEntity } from '../../../features/auth/entities/invalid-jwt.entity';
import { PairsGameEntity } from '../../../features/pair-game-quiz/entities/pairs-game.entity';
import { QuestionsQuizEntity } from '../../../features/sa-quiz-questions/entities/questions-quiz.entity';
import { PaymentTransactionsEntity } from '../../../features/products/entities/payment-transaction.entity';
import { ChallengeQuestionsEntity } from '../../../features/pair-game-quiz/entities/challenge-questions.entity';
import { StripeFactory } from './factory/stripe-factory';
import { PayPalFactory } from '../../../config/pay-pal/pay-pal-factory';
import { PayPalConfig } from '../../../config/pay-pal/pay-pal.config';
import { NodeEnvConfig } from '../../../config/node-env/node-env.config';
import { PostgresConfig } from '../../../config/db/postgres/postgres.config';
import { StripeConfig } from '../../../config/stripe/stripe.config';
import { ParseQueriesService } from '../../../common/query/parse-queries.service';
import { OrdersRepo } from '../../../features/products/infrastructure/orders.repo';
import { UsersRepo } from '../../../features/users/infrastructure/users-repo';
import { GuestUsersRepo } from '../../../features/users/infrastructure/guest-users.repo';
import { InvalidJwtRepo } from '../../../features/auth/infrastructure/invalid-jwt-repo';
import { ProductsRepo } from '../../../features/products/infrastructure/products.repo';
import { GamePairsRepo } from '../../../features/pair-game-quiz/infrastructure/game-pairs.repo';
import { GameQuestionsRepo } from '../../../features/pair-game-quiz/infrastructure/game-questions.repo';
import { ChallengesQuestionsRepo } from '../../../features/pair-game-quiz/infrastructure/challenges-questions.repo';

const stripeUseCases = [
  ConstructStripeEventUseCase,
  ProcessStripeSuccessUseCase,
  ProcessStripeChargeSucceededUseCase,
  ProcessStripeWebHookUseCase,
  FinalizeStripePaymentUseCase,
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
    PayPalFactory,
    PayPalConfig,
    NodeEnvConfig,
    PostgresConfig,
    StripeConfig,
    PaymentManager,
    StripeAdapter,
    PayPalAdapter,
    PaymentService,
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

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
import { UuidErrorResolver } from '../../../../common/helpers/uuid-error-resolver';
import { KeyResolver } from '../../../../common/helpers/key-resolver';
import { UsersEntity } from '../../../users/entities/users.entity';
import { GuestUsersEntity } from '../../../products/entities/unregistered-users.entity';
import { ProductsDataEntity } from '../../../products/entities/products-data.entity';
import { InvalidJwtEntity } from '../../../auth/entities/invalid-jwt.entity';
import { PairsGameEntity } from '../../../pair-game-quiz/entities/pairs-game.entity';
import { QuestionsQuizEntity } from '../../../sa-quiz-questions/entities/questions-quiz.entity';
import { PaymentTransactionsEntity } from '../../../products/entities/payment-transaction.entity';
import { ChallengeQuestionsEntity } from '../../../pair-game-quiz/entities/challenge-questions.entity';
import { PayPalFactory } from '../../../../config/pay-pal/pay-pal-factory';
import { PayPalConfig } from '../../../../config/pay-pal/pay-pal.config';
import { StripeFactory } from './factory/stripe-factory';
import { NodeEnvConfig } from '../../../../config/node-env/node-env.config';
import { PostgresConfig } from '../../../../config/db/postgres/postgres.config';
import { StripeConfig } from '../../../../config/stripe/stripe.config';
import { PaymentManager } from '../../payment-manager/payment-manager';
import { ParseQueriesService } from '../../../../common/query/parse-queries.service';
import { OrdersRepo } from '../../../products/infrastructure/orders.repo';
import { UsersRepo } from '../../../users/infrastructure/users-repo';
import { GuestUsersRepo } from '../../../users/infrastructure/guest-users.repo';
import { InvalidJwtRepo } from '../../../auth/infrastructure/invalid-jwt-repo';
import { ChallengesQuestionsRepo } from '../../../pair-game-quiz/infrastructure/challenges-questions.repo';
import { ProductsRepo } from '../../../products/infrastructure/products.repo';
import { GamePairsRepo } from '../../../pair-game-quiz/infrastructure/game-pairs.repo';
import { GameQuestionsRepo } from '../../../pair-game-quiz/infrastructure/game-questions.repo';
import { PaymentTransactionsRepo } from '../../infrastructure/payment-transactions.repo';
import { OrdersEntity } from '../../../products/entities/orders.entity';

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

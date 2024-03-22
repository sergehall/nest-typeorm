import { Module } from '@nestjs/common';
import { PayPalController } from './api/pay-pal.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayPalCapturePaymentUseCase } from './application/use-cases/pay-pal-capture-payment.use-case';
import { PayPalGenerateAccessTokenUseCase } from './application/use-cases/pay-pal-generate-access-token.use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { KeyResolver } from '../../../common/helpers/key-resolver';
import { UuidErrorResolver } from '../../../common/helpers/uuid-error-resolver';
import { UsersEntity } from '../../../features/users/entities/users.entity';
import { PairsGameEntity } from '../../../features/pair-game-quiz/entities/pairs-game.entity';
import { InvalidJwtEntity } from '../../../features/auth/entities/invalid-jwt.entity';
import { GuestUsersEntity } from '../../../features/products/entities/unregistered-users.entity';
import { QuestionsQuizEntity } from '../../../features/sa-quiz-questions/entities/questions-quiz.entity';
import { ChallengeQuestionsEntity } from '../../../features/pair-game-quiz/entities/challenge-questions.entity';
import { PayPalConfig } from '../../../config/pay-pal/pay-pal.config';
import { UsersRepo } from '../../../features/users/infrastructure/users-repo';
import { GamePairsRepo } from '../../../features/pair-game-quiz/infrastructure/game-pairs.repo';
import { InvalidJwtRepo } from '../../../features/auth/infrastructure/invalid-jwt-repo';
import { GuestUsersRepo } from '../../../features/users/infrastructure/guest-users.repo';
import { ChallengesQuestionsRepo } from '../../../features/pair-game-quiz/infrastructure/challenges-questions.repo';
import { GameQuestionsRepo } from '../../../features/pair-game-quiz/infrastructure/game-questions.repo';
import { NodeEnvConfig } from '../../../config/node-env/node-env.config';
import { PostgresConfig } from '../../../config/db/postgres/postgres.config';
import { PayPalFactory } from '../../../config/pay-pal/pay-pal-factory';
import { PayPalAdapter } from './adapter/pay-pal.adapter';
import { FinalizePayPalPaymentUseCase } from './application/use-cases/finalize-pay-pal-payment.use-case';
import { PaymentTransactionsRepo } from '../../infrastructure/payment-transactions.repo';
import { PaymentTransactionsEntity } from '../../../features/products/entities/payment-transaction.entity';
import { OrdersEntity } from '../../../features/products/entities/orders.entity';
import { ProcessPayPalWebhookUseCase } from './application/use-cases/process-pay-pal-webhook.use-case';

const payPalUseCases = [
  PayPalCapturePaymentUseCase,
  PayPalGenerateAccessTokenUseCase,
  ProcessPayPalWebhookUseCase,
  FinalizePayPalPaymentUseCase,
];
const helpers = [KeyResolver, UuidErrorResolver];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsersEntity,
      PairsGameEntity,
      GuestUsersEntity,
      InvalidJwtEntity,
      QuestionsQuizEntity,
      ChallengeQuestionsEntity,
      PaymentTransactionsEntity,
      OrdersEntity,
    ]),
    CqrsModule,
  ],
  controllers: [PayPalController],
  providers: [
    PayPalAdapter,
    PayPalFactory,
    PayPalConfig,
    PostgresConfig,
    NodeEnvConfig,
    UsersRepo,
    GamePairsRepo,
    InvalidJwtRepo,
    GuestUsersRepo,
    GameQuestionsRepo,
    PaymentTransactionsRepo,
    ChallengesQuestionsRepo,
    ...helpers,
    ...payPalUseCases,
  ],
})
export class PayPalModule {}

import { Module } from '@nestjs/common';
import { PayPalController } from './api/pay-pal.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayPalGenerateAccessTokenUseCase } from './application/use-cases/pay-pal-generate-access-token.use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { ProcessPayPalWebhookUseCase } from './application/use-cases/process-pay-pal-webhook.use-case';
import { FinalizePayPalPaymentUseCase } from './application/use-cases/finalize-pay-pal-payment.use-case';
import { PaymentService } from '../../application/payment.service';
import { PayPalCapturePaymentUseCase } from './application/use-cases/pay-pal-capture-payment.use-case';
import { KeyResolver } from '../../../../common/helpers/key-resolver';
import { UuidErrorResolver } from '../../../../common/helpers/uuid-error-resolver';
import { UsersEntity } from '../../../users/entities/users.entity';
import { PairsGameEntity } from '../../../pair-game-quiz/entities/pairs-game.entity';
import { GuestUsersEntity } from '../../../products/entities/unregistered-users.entity';
import { InvalidJwtEntity } from '../../../auth/entities/invalid-jwt.entity';
import { QuestionsQuizEntity } from '../../../sa-quiz-questions/entities/questions-quiz.entity';
import { ChallengeQuestionsEntity } from '../../../pair-game-quiz/entities/challenge-questions.entity';
import { PaymentTransactionsEntity } from '../../../products/entities/payment-transaction.entity';
import { OrdersEntity } from '../../../products/entities/orders.entity';
import { PayPalAdapter } from './adapter/pay-pal.adapter';
import { PayPalFactory } from '../../../../config/pay-pal/pay-pal-factory';
import { PayPalConfig } from '../../../../config/pay-pal/pay-pal.config';
import { PostgresConfig } from '../../../../config/db/postgres/postgres.config';
import { NodeEnvConfig } from '../../../../config/node-env/node-env.config';
import { UsersRepo } from '../../../users/infrastructure/users-repo';
import { GamePairsRepo } from '../../../pair-game-quiz/infrastructure/game-pairs.repo';
import { InvalidJwtRepo } from '../../../auth/infrastructure/invalid-jwt-repo';
import { GuestUsersRepo } from '../../../users/infrastructure/guest-users.repo';
import { PaymentTransactionsRepo } from '../../infrastructure/payment-transactions.repo';
import { ChallengesQuestionsRepo } from '../../../pair-game-quiz/infrastructure/challenges-questions.repo';
import { GameQuestionsRepo } from '../../../pair-game-quiz/infrastructure/game-questions.repo';

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
    PaymentService,
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

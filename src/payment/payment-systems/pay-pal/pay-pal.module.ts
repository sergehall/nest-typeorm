import { Module } from '@nestjs/common';
import { PayPalController } from './api/pay-pal.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayPalCapturePaymentUseCase } from './application/use-cases/pay-pal-capture-payment.use-case';
import { PayPalGenerateAccessTokenUseCase } from './application/use-cases/pay-pal-generate-access-token.use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { PayPalAdapter } from './adapter/pay-pal.adapter';
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

const payPalUseCases = [
  PayPalCapturePaymentUseCase,
  PayPalGenerateAccessTokenUseCase,
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
    ]),
    CqrsModule,
  ],
  controllers: [PayPalController],
  providers: [
    PayPalConfig,
    PayPalAdapter,
    UsersRepo,
    GamePairsRepo,
    InvalidJwtRepo,
    GuestUsersRepo,
    GameQuestionsRepo,
    ChallengesQuestionsRepo,
    ...helpers,
    ...payPalUseCases,
  ],
})
export class PayPalModule {}
import { Module } from '@nestjs/common';
import { PayPalController } from './api/pay-pal.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvalidJwtRepo } from '../../../features/auth/infrastructure/invalid-jwt-repo';
import { InvalidJwtEntity } from '../../../features/auth/entities/invalid-jwt.entity';
import { CqrsModule } from '@nestjs/cqrs';
import { UsersRepo } from '../../../features/users/infrastructure/users-repo';
import { UsersEntity } from '../../../features/users/entities/users.entity';
import { KeyResolver } from '../../../common/helpers/key-resolver';
import { UuidErrorResolver } from '../../../common/helpers/uuid-error-resolver';
import { GamePairsRepo } from '../../../features/pair-game-quiz/infrastructure/game-pairs.repo';
import { PairsGameEntity } from '../../../features/pair-game-quiz/entities/pairs-game.entity';
import { ChallengesQuestionsRepo } from '../../../features/pair-game-quiz/infrastructure/challenges-questions.repo';
import { ChallengeQuestionsEntity } from '../../../features/pair-game-quiz/entities/challenge-questions.entity';
import { GameQuestionsRepo } from '../../../features/pair-game-quiz/infrastructure/game-questions.repo';
import { QuestionsQuizEntity } from '../../../features/sa-quiz-questions/entities/questions-quiz.entity';
import { GuestUsersRepo } from '../../../features/users/infrastructure/guest-users.repo';
import { GuestUsersEntity } from '../../../features/products/entities/unregistered-users.entity';

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
    UsersRepo,
    GamePairsRepo,
    InvalidJwtRepo,
    GuestUsersRepo,
    GameQuestionsRepo,
    ChallengesQuestionsRepo,
    ...helpers,
  ],
})
export class PayPalModule {}

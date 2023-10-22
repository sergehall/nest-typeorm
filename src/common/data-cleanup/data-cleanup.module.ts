import { DataCleanupService } from './data-cleanup.service';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { KeyResolver } from '../helpers/key-resolver';
import { InvalidJwtRepo } from '../../features/auth/infrastructure/invalid-jwt-repo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvalidJwtEntity } from '../../features/auth/entities/invalid-jwt.entity';
import { SecurityDevicesRepo } from '../../features/security-devices/infrastructure/security-devices.repo';
import { SecurityDevicesEntity } from '../../features/security-devices/entities/session-devices.entity';
import { UsersRepo } from '../../features/users/infrastructure/users-repo';
import { UsersEntity } from '../../features/users/entities/users.entity';
import { UuidErrorResolver } from '../helpers/uuid-error-resolver';
import { GamePairsRepo } from '../../features/pair-game-quiz/infrastructure/game-pairs.repo';
import { PairsGameEntity } from '../../features/pair-game-quiz/entities/pairs-game.entity';
import { ChallengeQuestionsEntity } from '../../features/pair-game-quiz/entities/challenge-questions.entity';
import { ChallengesQuestionsRepo } from '../../features/pair-game-quiz/infrastructure/challenges-questions.repo';
import { QuestionsQuizEntity } from '../../features/sa-quiz-questions/entities/questions-quiz.entity';
import { GameQuestionsRepo } from '../../features/pair-game-quiz/infrastructure/game-questions.repo';

const helpers = [KeyResolver, UuidErrorResolver];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsersEntity,
      InvalidJwtEntity,
      SecurityDevicesEntity,
      PairsGameEntity,
      QuestionsQuizEntity,
      ChallengeQuestionsEntity,
    ]),
    CqrsModule,
  ],
  providers: [
    DataCleanupService,
    UsersRepo,
    InvalidJwtRepo,
    SecurityDevicesRepo,
    GamePairsRepo,
    GameQuestionsRepo,
    ChallengesQuestionsRepo,
    ...helpers,
  ],
})
export class DataCleanupModule {}

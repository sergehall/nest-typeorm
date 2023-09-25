import { Module } from '@nestjs/common';
import { QuizQuestionsService } from './application/quiz-questions.service';
import { QuizQuestionsController } from './api/quiz-questions.controller';
import { SaCreateSuperAdmin } from '../sa/application/use-cases/sa-create-super-admin.use-case';
import { ExpirationDateCalculator } from '../../common/helpers/expiration-date-calculator';
import { UsersRepo } from '../users/infrastructure/users-repo';
import { KeyResolver } from '../../common/helpers/key-resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from '../users/entities/users.entity';
import { CaslModule } from '../../ability/casl.module';
import { CqrsModule } from '@nestjs/cqrs';
import { EncryptConfig } from '../../config/encrypt/encrypt-config';
import { SaCreateQuestionsAndAnswerUseCase } from './application/use-cases/sa-create-questions-and-answer.use-case';
import { GameQuizRepo } from '../pair-game-quiz/infrastructure/game-quiz-repo';
import { QuestionsQuizEntity } from '../pair-game-quiz/entities/questions-quiz.entity';
import { PairsGameQuizEntity } from '../pair-game-quiz/entities/pairs-game-quiz.entity';
import { ChallengeQuestionsEntity } from '../pair-game-quiz/entities/challenge-questions.entity';
import { ChallengeAnswersEntity } from '../pair-game-quiz/entities/challenge-answers.entity';

const saQuizUseCases = [SaCreateQuestionsAndAnswerUseCase];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsersEntity,
      QuestionsQuizEntity,
      PairsGameQuizEntity,
      ChallengeQuestionsEntity,
      ChallengeAnswersEntity,
    ]),
    CaslModule,
    CqrsModule,
  ],
  controllers: [QuizQuestionsController],
  providers: [
    GameQuizRepo,
    QuizQuestionsService,
    UsersRepo,
    SaCreateSuperAdmin,
    ExpirationDateCalculator,
    EncryptConfig,
    KeyResolver,
    ...saQuizUseCases,
  ],
})
export class QuizQuestionsModule {}

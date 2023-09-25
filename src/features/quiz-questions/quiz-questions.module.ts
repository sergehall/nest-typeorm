import { Module } from '@nestjs/common';
import { QuizQuestionsService } from './application/quiz-questions.service';
import { QuizQuestionsController } from './api/quiz-questions.controller';
import { SaCreateSuperAdmin } from '../sa/application/use-cases/sa-create-super-admin.use-case';
import { ExpirationDateCalculator } from '../../common/helpers/expiration-date-calculator';
import { UsersRepo } from '../users/infrastructure/users-repo';
import { KeyResolver } from '../../common/helpers/key-resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from '../users/entities/users.entity';
import { CqrsModule } from '@nestjs/cqrs';
import { EncryptConfig } from '../../config/encrypt/encrypt-config';
import { SaCreateQuestionsAndAnswerUseCase } from './application/use-cases/sa-create-questions-and-answer.use-case';
import { GameQuizRepo } from '../pair-game-quiz/infrastructure/game-quiz-repo';
import { QuestionsQuizEntity } from '../pair-game-quiz/entities/questions-quiz.entity';
import { PairsGameQuizEntity } from '../pair-game-quiz/entities/pairs-game-quiz.entity';
import { ChallengeQuestionsEntity } from '../pair-game-quiz/entities/challenge-questions.entity';
import { ChallengeAnswersEntity } from '../pair-game-quiz/entities/challenge-answers.entity';
import { ParseQueriesService } from '../../common/query/parse-queries.service';
import { SaGetQuestionsUseCase } from './application/use-cases/sa-get-questions.use-case';
import { TransformationService } from './common/transform-to-questions-model';

const saQuizUseCases = [
  SaCreateQuestionsAndAnswerUseCase,
  SaGetQuestionsUseCase,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsersEntity,
      QuestionsQuizEntity,
      PairsGameQuizEntity,
      ChallengeQuestionsEntity,
      ChallengeAnswersEntity,
    ]),
    CqrsModule,
  ],
  controllers: [QuizQuestionsController],
  providers: [
    SaCreateSuperAdmin,
    ParseQueriesService,
    QuizQuestionsService,
    UsersRepo,
    GameQuizRepo,
    ExpirationDateCalculator,
    EncryptConfig,
    KeyResolver,
    TransformationService,
    ...saQuizUseCases,
  ],
})
export class QuizQuestionsModule {}

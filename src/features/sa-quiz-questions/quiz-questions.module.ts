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
import { QuestionsQuizEntity } from './entities/questions-quiz.entity';
import { ChallengeQuestionsEntity } from '../pair-game-quiz/entities/challenge-questions.entity';
import { ChallengeAnswersEntity } from '../pair-game-quiz/entities/challenge-answers.entity';
import { ParseQueriesService } from '../../common/query/parse-queries.service';
import { SaGetQuestionsUseCase } from './application/use-cases/sa-get-questions.use-case';
import { TransformationService } from './common/transform-to-questions-model';
import { SaUpdateQuestionsAndAnswerUseCase } from './application/use-cases/sa-update-questions-and-answer.use-case';
import { SaDeleteQuestionByIdUseCase } from './application/use-cases/sa-delete-question-by-id.use-case';
import { SaUpdateQuestionsPublishUseCase } from './application/use-cases/sa-update-questions-publish.use-case';
import { UuidErrorResolver } from '../../common/helpers/uuid-error-resolver';
import { GameQuestionsRepo } from '../pair-game-quiz/infrastructure/game-questions-repo';
import { ChallengesQuestionsRepo } from '../pair-game-quiz/infrastructure/challenges-questions-repo';
import { ChallengesAnswersRepo } from '../pair-game-quiz/infrastructure/challenges-answers-repo';
import { PairsGameEntity } from '../pair-game-quiz/entities/pairs-game.entity';
import { PairsGameRepo } from '../pair-game-quiz/infrastructure/game-quiz-repo';

const saQuizUseCases = [
  SaCreateQuestionsAndAnswerUseCase,
  SaGetQuestionsUseCase,
  SaUpdateQuestionsAndAnswerUseCase,
  SaDeleteQuestionByIdUseCase,
  SaUpdateQuestionsPublishUseCase,
];

const helpers = [KeyResolver, UuidErrorResolver];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsersEntity,
      QuestionsQuizEntity,
      PairsGameEntity,
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
    PairsGameRepo,
    GameQuestionsRepo,
    ChallengesAnswersRepo,
    ChallengesQuestionsRepo,
    ExpirationDateCalculator,
    EncryptConfig,
    TransformationService,
    ...helpers,
    ...saQuizUseCases,
  ],
})
export class QuizQuestionsModule {}

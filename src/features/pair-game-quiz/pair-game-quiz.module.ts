import { Module } from '@nestjs/common';
import { CaslModule } from '../../ability/casl.module';
import { PairGameQuizService } from './application/pair-game-quiz.service';
import { PairGameQuizController } from './api/pair-game-quiz.controller';
import { GameQuizRepo } from './infrastructure/game-quiz-repo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionsQuizEntity } from '../sa-quiz-questions/entities/questions-quiz.entity';
import { StartGameUseCase } from './application/use-cases/start-game.use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { ChallengeQuestionsEntity } from './entities/challenge-questions.entity';
import { ChallengeAnswersEntity } from './entities/challenge-answers.entity';
import { PairsGameQuizEntity } from './entities/pairs-game-quiz.entity';
import { MapPairGame } from './common/map-pair-game-entity-to-game-model';
import { MyCurrentGameUseCase } from './application/use-cases/my-current-game.use-case';
import { GetGameByIdUseCase } from './application/use-cases/get-game-by-id.use-case';
import { KeyResolver } from '../../common/helpers/key-resolver';
import { UuidErrorResolver } from '../../common/helpers/uuid-error-resolver';
import { SubmitAnswerForCurrentQuestionUseCase } from './application/use-cases/submit-answer-for-current-question.use-case';
import { GamesResultsEntity } from './entities/games-results.entity';
import { AddResultGameToDbUseCase } from './application/use-cases/add-result-game-to-db.use-case';

const usersUseCases = [
  MyCurrentGameUseCase,
  GetGameByIdUseCase,
  StartGameUseCase,
  SubmitAnswerForCurrentQuestionUseCase,
  AddResultGameToDbUseCase,
];

const helpers = [KeyResolver, UuidErrorResolver];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      QuestionsQuizEntity,
      PairsGameQuizEntity,
      ChallengeQuestionsEntity,
      ChallengeAnswersEntity,
      GamesResultsEntity,
    ]),
    CaslModule,
    CqrsModule,
  ],
  controllers: [PairGameQuizController],
  providers: [
    PairGameQuizService,
    GameQuizRepo,
    MapPairGame,
    ...helpers,
    ...usersUseCases,
  ],
})
export class PairGameQuizModule {}

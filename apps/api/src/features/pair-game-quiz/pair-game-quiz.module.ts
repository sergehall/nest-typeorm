import { Module } from '@nestjs/common';
import { CaslModule } from '../../ability/casl.module';
import { PairGameQuizService } from './application/pair-game-quiz.service';
import { PairGameQuizController } from './api/pair-game-quiz.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionsQuizEntity } from '../sa-quiz-questions/entities/questions-quiz.entity';
import { StartGameUseCase } from './application/use-cases/start-game.use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { ChallengeQuestionsEntity } from './entities/challenge-questions.entity';
import { ChallengeAnswersEntity } from './entities/challenge-answers.entity';
import { MapPairGame } from './common/map-pair-game-entity-to-game-model';
import { MyCurrentGameUseCase } from './application/use-cases/my-current-game.use-case';
import { GetGameByIdUseCase } from './application/use-cases/get-game-by-id.use-case';
import { KeyResolver } from '../../common/helpers/key-resolver';
import { UuidErrorResolver } from '../../common/helpers/uuid-error-resolver';
import { SubmitAnswerForCurrentQuestionUseCase } from './application/use-cases/submit-answer-for-current-question.use-case';
import { AddResultToPairGameUseCase } from './application/use-cases/add-result-to-pair-game.use-case';
import { ParseQueriesService } from '../../common/query/parse-queries.service';
import { GetMyGamesUseCase } from './application/use-cases/my-games.use-case';
import { GameQuestionsRepo } from './infrastructure/game-questions.repo';
import { ChallengesQuestionsRepo } from './infrastructure/challenges-questions.repo';
import { ChallengesAnswersRepo } from './infrastructure/challenges-answers.repo';
import { PairsGameEntity } from './entities/pairs-game.entity';
import { MyGamesStatisticUseCase } from './application/use-cases/my-games-statistic.use-case';
import { GamePairsRepo } from './infrastructure/game-pairs.repo';
import { GamesStatisticUseCase } from './application/use-cases/games-statistic.use-case';
import { PlayerAnswersAllQuestionsUseCase } from './application/use-cases/player-answers-all-questions.use-case';
import { FinishGameForAnotherUserUseCase } from './application/use-cases/finish-game-for-another-user.use-case';
import { AddResultToFinishedGameEventHandler } from './events-handlers/add-result-to-finished-game.event.handler';

const usersUseCases = [
  MyCurrentGameUseCase,
  GetGameByIdUseCase,
  StartGameUseCase,
  SubmitAnswerForCurrentQuestionUseCase,
  AddResultToPairGameUseCase,
  GetMyGamesUseCase,
  MyGamesStatisticUseCase,
  GamesStatisticUseCase,
  PlayerAnswersAllQuestionsUseCase,
  FinishGameForAnotherUserUseCase,
];

const gamesEventHandlers = [AddResultToFinishedGameEventHandler];

const helpers = [KeyResolver, UuidErrorResolver];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      QuestionsQuizEntity,
      PairsGameEntity,
      ChallengeQuestionsEntity,
      ChallengeAnswersEntity,
    ]),
    CaslModule,
    CqrsModule,
  ],
  controllers: [PairGameQuizController],
  providers: [
    ParseQueriesService,
    PairGameQuizService,
    GameQuestionsRepo,
    GamePairsRepo,
    ChallengesAnswersRepo,
    ChallengesQuestionsRepo,
    MapPairGame,
    ...gamesEventHandlers,
    ...helpers,
    ...usersUseCases,
  ],
})
export class PairGameQuizModule {}

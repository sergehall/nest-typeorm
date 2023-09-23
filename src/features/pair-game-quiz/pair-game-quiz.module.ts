import { Module } from '@nestjs/common';
import { PairGameQuizService } from './application/pair-game-quiz.service';
import { PairGameQuizController } from './api/pair-game-quiz.controller';
import { GameQuizRepo } from './infrastructure/game-quiz-repo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionsQuizEntity } from './entities/questions-quiz.entity';
import { StartGameUseCase } from './application/use-cases/start-game.use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { ChallengeQuestionsEntity } from './entities/challenge-questions.entity';
import { ChallengeAnswersEntity } from './entities/challenge-answers.entity';
import { PairsGameQuizEntity } from './entities/pairs-game-quiz.entity';
import { MapPairGame } from './common/map-pair-game-entity-to-game-model';
import { MyCurrentGameUseCase } from './application/use-cases/my-current-game.use-case';

const usersUseCases = [MyCurrentGameUseCase, StartGameUseCase];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      QuestionsQuizEntity,
      PairsGameQuizEntity,
      ChallengeQuestionsEntity,
      ChallengeAnswersEntity,
    ]),
    CqrsModule,
  ],
  controllers: [PairGameQuizController],
  providers: [PairGameQuizService, GameQuizRepo, MapPairGame, ...usersUseCases],
})
export class PairGameQuizModule {}
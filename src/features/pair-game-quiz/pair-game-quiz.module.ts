import { Module } from '@nestjs/common';
import { PairGameQuizService } from './application/pair-game-quiz.service';
import { PairGameQuizController } from './api/pair-game-quiz.controller';
import { GameQuizRepo } from './infrastructure/game-quiz-repo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionsQuizEntity } from './entities/questions-quiz.entity';
import { StartGameUseCase } from './application/use-cases/start-game.use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { PairGameQuizEntity } from './entities/pair-game-quiz.entity';
import { ChallengeQuestionsEntity } from './entities/challenge-questions.entity';
import { ChallengeAnswersEntity } from './entities/challenge-answers.entity';

const usersUseCases = [StartGameUseCase];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      QuestionsQuizEntity,
      PairGameQuizEntity,
      ChallengeQuestionsEntity,
      ChallengeAnswersEntity,
    ]),
    CqrsModule,
  ],
  controllers: [PairGameQuizController],
  providers: [PairGameQuizService, GameQuizRepo, ...usersUseCases],
})
export class PairGameQuizModule {}

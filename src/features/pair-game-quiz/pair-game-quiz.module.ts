import { Module } from '@nestjs/common';
import { PairGameQuizService } from './application/pair-game-quiz.service';
import { PairGameQuizController } from './api/pair-game-quiz.controller';
import { PairGameQuizRepo } from './infrastructure/PairGameQuizRepo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionsQuizEntity } from './entities/questions-quiz.entity';
import { StartGameUseCase } from './application/use-cases/start-game.use-case';
import { CqrsModule } from '@nestjs/cqrs';

const usersUseCases = [StartGameUseCase];

@Module({
  imports: [TypeOrmModule.forFeature([QuestionsQuizEntity]), CqrsModule],
  controllers: [PairGameQuizController],
  providers: [PairGameQuizService, PairGameQuizRepo, ...usersUseCases],
})
export class PairGameQuizModule {}

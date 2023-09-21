import { Module } from '@nestjs/common';
import { PairGameQuizService } from './application/pair-game-quiz.service';
import { PairGameQuizController } from './api/pair-game-quiz.controller';
import { PairGameQuizRepo } from './infrastructure/PairGameQuizRepo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionsQuizEntity } from './entities/questions-quiz.entity';

@Module({
  imports: [TypeOrmModule.forFeature([QuestionsQuizEntity])],
  controllers: [PairGameQuizController],
  providers: [PairGameQuizService, PairGameQuizRepo],
})
export class PairGameQuizModule {}

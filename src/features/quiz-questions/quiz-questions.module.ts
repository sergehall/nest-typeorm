import { Module } from '@nestjs/common';
import { QuizQuestionsService } from './application/quiz-questions.service';
import { QuizQuestionsController } from './api/quiz-questions.controller';

@Module({
  controllers: [QuizQuestionsController],
  providers: [QuizQuestionsService],
})
export class QuizQuestionsModule {}

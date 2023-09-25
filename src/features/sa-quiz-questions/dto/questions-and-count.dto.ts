import { QuestionsQuizEntity } from '../entities/questions-quiz.entity';

export class QuestionsAndCountDto {
  questions: QuestionsQuizEntity[];
  countQuestions: number;
}

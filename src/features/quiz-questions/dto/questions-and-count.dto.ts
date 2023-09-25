import { QuestionsQuizEntity } from '../../pair-game-quiz/entities/questions-quiz.entity';

export class QuestionsAndCountDto {
  questions: QuestionsQuizEntity[];
  countQuestions: number;
}

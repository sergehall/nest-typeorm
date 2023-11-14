import { Injectable } from '@nestjs/common';
import { QuestionsQuizEntity } from '../entities/questions-quiz.entity';
import { QuestionsViewModel } from '../views/questions.view-model';

@Injectable()
export class SaQuizQuestionsService {
  async transformEntityToQuestionsModelArray(
    newQuestions: QuestionsQuizEntity[],
  ): Promise<QuestionsViewModel[]> {
    const transformedQuestions: QuestionsViewModel[] = [];

    for (let i = 0; i < newQuestions.length; i++) {
      const newQuestion = newQuestions[i];

      const transformedQuestion: QuestionsViewModel = {
        id: newQuestion.id,
        body: newQuestion.questionText,
        correctAnswers: newQuestion.hashedAnswers,
        published: newQuestion.published,
        createdAt: newQuestion.createdAt,
        updatedAt: newQuestion.updatedAt,
      };

      transformedQuestions.push(transformedQuestion);
    }

    return transformedQuestions;
  }
}

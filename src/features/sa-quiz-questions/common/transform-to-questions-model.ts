import { QuestionsQuizEntity } from '../entities/questions-quiz.entity';
import { QuestionsModel } from '../models/questions.model';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TransformationService {
  async transformEntityToQuestionsModelArray(
    newQuestions: QuestionsQuizEntity[],
  ): Promise<QuestionsModel[]> {
    const transformedQuestions: QuestionsModel[] = [];

    for (let i = 0; i < newQuestions.length; i++) {
      const newQuestion = newQuestions[i];

      const transformedQuestion: QuestionsModel = {
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

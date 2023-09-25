import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateQuizQuestionDto } from '../../dto/create-quiz-question.dto';
import { GameQuizRepo } from '../../../pair-game-quiz/infrastructure/game-quiz-repo';
import { QuestionsQuizEntity } from '../../../pair-game-quiz/entities/questions-quiz.entity';
import { QuestionsModel } from '../../models/questions.model';

export class SaCreateQuestionsAndAnswerCommand {
  constructor(public createQuizQuestionDto: CreateQuizQuestionDto) {}
}

@CommandHandler(SaCreateQuestionsAndAnswerCommand)
export class SaCreateQuestionsAndAnswerUseCase
  implements ICommandHandler<SaCreateQuestionsAndAnswerCommand>
{
  constructor(protected gameQuizRepo: GameQuizRepo) {}
  async execute(
    command: SaCreateQuestionsAndAnswerCommand,
  ): Promise<QuestionsModel> {
    const { createQuizQuestionDto } = command;
    const newQuestion: QuestionsQuizEntity =
      await this.gameQuizRepo.saCreateQuestion(createQuizQuestionDto);

    return await this.transformObject(newQuestion);
  }

  private async transformObject(
    newQuestion: QuestionsQuizEntity,
  ): Promise<QuestionsModel> {
    return {
      id: newQuestion.id,
      body: newQuestion.questionText,
      correctAnswers: newQuestion.hashedAnswers,
      published: newQuestion.published,
      createdAt: newQuestion.createdAt,
      updatedAt: newQuestion.updatedAt,
    };
  }
}

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionsQuizEntity } from '../../entities/questions-quiz.entity';
import { NotFoundException } from '@nestjs/common';
import { GameQuestionsRepo } from '../../../pair-game-quiz/infrastructure/game-questions.repo';

export class SaDeleteQuestionByIdCommand {
  constructor(public questionId: string) {}
}

@CommandHandler(SaDeleteQuestionByIdCommand)
export class SaDeleteQuestionByIdUseCase
  implements ICommandHandler<SaDeleteQuestionByIdCommand>
{
  constructor(private readonly gameQuestionsRepo: GameQuestionsRepo) {}

  async execute(command: SaDeleteQuestionByIdCommand): Promise<boolean> {
    const { questionId } = command;

    const question: QuestionsQuizEntity | null =
      await this.gameQuestionsRepo.getQuestionById(questionId);
    if (!question)
      throw new NotFoundException(`Question with ID ${questionId} not found`);

    return await this.gameQuestionsRepo.saDeleteQuestionById(questionId);
  }
}

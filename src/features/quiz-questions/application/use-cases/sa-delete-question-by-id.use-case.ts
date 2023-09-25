import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GameQuizRepo } from '../../../pair-game-quiz/infrastructure/game-quiz-repo';
import { QuestionsQuizEntity } from '../../../pair-game-quiz/entities/questions-quiz.entity';
import { NotFoundException } from '@nestjs/common';

export class SaDeleteQuestionByIdCommand {
  constructor(public questionId: string) {}
}

@CommandHandler(SaDeleteQuestionByIdCommand)
export class SaDeleteQuestionByIdUseCase
  implements ICommandHandler<SaDeleteQuestionByIdCommand>
{
  constructor(private readonly gameQuizRepo: GameQuizRepo) {}

  async execute(command: SaDeleteQuestionByIdCommand): Promise<boolean> {
    const { questionId } = command;

    const question: QuestionsQuizEntity | null =
      await this.gameQuizRepo.getQuestionById(questionId);
    if (!question)
      throw new NotFoundException(`Question with ID ${questionId} not found`);

    return await this.gameQuizRepo.saDeleteQuestionById(questionId);
  }
}

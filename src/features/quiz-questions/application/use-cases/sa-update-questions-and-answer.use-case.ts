import { UpdateQuizQuestionDto } from '../../dto/update-quiz-question.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GameQuizRepo } from '../../../pair-game-quiz/infrastructure/game-quiz-repo';
import { NotFoundException } from '@nestjs/common';
import { QuestionsQuizEntity } from '../../../pair-game-quiz/entities/questions-quiz.entity';

export class SaUpdateQuestionsAndAnswerCommand {
  constructor(
    public questionId: string,
    public updateQuizQuestionDto: UpdateQuizQuestionDto,
  ) {}
}

@CommandHandler(SaUpdateQuestionsAndAnswerCommand)
export class SaUpdateQuestionsAndAnswerUseCase
  implements ICommandHandler<SaUpdateQuestionsAndAnswerCommand>
{
  constructor(private readonly gameQuizRepo: GameQuizRepo) {}

  async execute(command: SaUpdateQuestionsAndAnswerCommand): Promise<boolean> {
    const { questionId, updateQuizQuestionDto } = command;

    const question: QuestionsQuizEntity | null =
      await this.gameQuizRepo.getQuestionById(questionId);
    if (!question)
      throw new NotFoundException(`Question with ID ${questionId} not found`);

    return await this.gameQuizRepo.saUpdateQuestionAndAnswer(
      question,
      updateQuizQuestionDto,
    );
  }
}

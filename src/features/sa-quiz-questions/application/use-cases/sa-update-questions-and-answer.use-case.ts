import { UpdateQuizQuestionDto } from '../../dto/update-quiz-question.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { QuestionsQuizEntity } from '../../entities/questions-quiz.entity';
import { GameQuestionsRepo } from '../../../pair-game-quiz/infrastructure/game-questions.repo';

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
  constructor(private readonly gameQuestionsRepo: GameQuestionsRepo) {}

  async execute(command: SaUpdateQuestionsAndAnswerCommand): Promise<boolean> {
    const { questionId, updateQuizQuestionDto } = command;

    const question: QuestionsQuizEntity | null =
      await this.gameQuestionsRepo.getQuestionById(questionId);
    if (!question)
      throw new NotFoundException(`Question with ID ${questionId} not found`);

    return await this.gameQuestionsRepo.saUpdateQuestionAndAnswers(
      question,
      updateQuizQuestionDto,
    );
  }
}

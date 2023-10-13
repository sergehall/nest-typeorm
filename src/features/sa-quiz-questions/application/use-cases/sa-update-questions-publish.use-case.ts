import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { QuestionsQuizEntity } from '../../entities/questions-quiz.entity';
import { UpdatePublishDto } from '../../dto/update-publish.dto';
import { GameQuestionsRepo } from '../../../pair-game-quiz/infrastructure/game-questions.repo';

export class SaUpdateQuestionsPublishCommand {
  constructor(
    public questionId: string,
    public updatePublishDto: UpdatePublishDto,
  ) {}
}

@CommandHandler(SaUpdateQuestionsPublishCommand)
export class SaUpdateQuestionsPublishUseCase
  implements ICommandHandler<SaUpdateQuestionsPublishCommand>
{
  constructor(private readonly gameQuestionsRepo: GameQuestionsRepo) {}

  async execute(command: SaUpdateQuestionsPublishCommand): Promise<boolean> {
    const { questionId, updatePublishDto } = command;

    const question: QuestionsQuizEntity | null =
      await this.gameQuestionsRepo.getQuestionById(questionId);
    if (!question)
      throw new NotFoundException(`Question with ID ${questionId} not found`);

    return await this.gameQuestionsRepo.saUpdateQuestionPublish(
      question,
      updatePublishDto,
    );
  }
}

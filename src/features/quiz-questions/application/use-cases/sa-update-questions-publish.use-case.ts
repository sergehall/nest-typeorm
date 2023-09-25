import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GameQuizRepo } from '../../../pair-game-quiz/infrastructure/game-quiz-repo';
import { NotFoundException } from '@nestjs/common';
import { QuestionsQuizEntity } from '../../../pair-game-quiz/entities/questions-quiz.entity';
import { UpdatePublishDto } from '../../dto/update-publish.dto';

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
  constructor(private readonly gameQuizRepo: GameQuizRepo) {}

  async execute(command: SaUpdateQuestionsPublishCommand): Promise<boolean> {
    const { questionId, updatePublishDto } = command;

    const question: QuestionsQuizEntity | null =
      await this.gameQuizRepo.getQuestionById(questionId);
    if (!question)
      throw new NotFoundException(`Question with ID ${questionId} not found`);

    return await this.gameQuizRepo.saUpdateQuestionPublish(
      question,
      updatePublishDto,
    );
  }
}

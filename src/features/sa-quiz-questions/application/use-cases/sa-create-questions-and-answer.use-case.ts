import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateQuizQuestionDto } from '../../dto/create-quiz-question.dto';
import { QuestionsQuizEntity } from '../../entities/questions-quiz.entity';
import { QuestionsModel } from '../../models/questions.model';
import { TransformationService } from '../../common/transform-to-questions-model';
import { GameQuestionsRepo } from '../../../pair-game-quiz/infrastructure/game-questions-repo';

export class SaCreateQuestionsAndAnswerCommand {
  constructor(public createQuizQuestionDto: CreateQuizQuestionDto) {}
}

@CommandHandler(SaCreateQuestionsAndAnswerCommand)
export class SaCreateQuestionsAndAnswerUseCase
  implements ICommandHandler<SaCreateQuestionsAndAnswerCommand>
{
  constructor(
    protected gameQuestionsRepo: GameQuestionsRepo,
    protected transformationService: TransformationService,
  ) {}
  async execute(
    command: SaCreateQuestionsAndAnswerCommand,
  ): Promise<QuestionsModel> {
    const { createQuizQuestionDto } = command;
    const newQuestion: QuestionsQuizEntity =
      await this.gameQuestionsRepo.saCreateQuestion(createQuizQuestionDto);

    const newQuestionArr: QuestionsModel[] =
      await this.transformationService.transformEntityToQuestionsModelArray([
        newQuestion,
      ]);

    return newQuestionArr[0];
  }
}

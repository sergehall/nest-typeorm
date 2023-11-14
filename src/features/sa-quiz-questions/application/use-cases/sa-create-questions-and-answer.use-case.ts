import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateQuizQuestionDto } from '../../dto/create-quiz-question.dto';
import { QuestionsQuizEntity } from '../../entities/questions-quiz.entity';
import { QuestionsViewModel } from '../../views/questions.view-model';
import { GameQuestionsRepo } from '../../../pair-game-quiz/infrastructure/game-questions.repo';
import { SaQuizQuestionsService } from '../sa-quiz-questions.service';

export class SaCreateQuestionsAndAnswerCommand {
  constructor(public createQuizQuestionDto: CreateQuizQuestionDto) {}
}

@CommandHandler(SaCreateQuestionsAndAnswerCommand)
export class SaCreateQuestionsAndAnswerUseCase
  implements ICommandHandler<SaCreateQuestionsAndAnswerCommand>
{
  constructor(
    protected gameQuestionsRepo: GameQuestionsRepo,
    protected quizQuestionsService: SaQuizQuestionsService,
  ) {}
  async execute(
    command: SaCreateQuestionsAndAnswerCommand,
  ): Promise<QuestionsViewModel> {
    const { createQuizQuestionDto } = command;
    const newQuestion: QuestionsQuizEntity =
      await this.gameQuestionsRepo.saCreateQuestion(createQuizQuestionDto);

    const newQuestionArr: QuestionsViewModel[] =
      await this.quizQuestionsService.transformEntityToQuestionsModelArray([
        newQuestion,
      ]);

    return newQuestionArr[0];
  }
}

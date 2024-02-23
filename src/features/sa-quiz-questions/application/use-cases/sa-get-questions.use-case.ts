import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ParseQueriesDto } from '../../../../common/query/dto/parse-queries.dto';
import { PaginatorDto } from '../../../../common/helpers/paginator.dto';
import { QuestionsAndCountDto } from '../../dto/questions-and-count.dto';
import { GameQuestionsRepo } from '../../../pair-game-quiz/infrastructure/game-questions.repo';
import { SaQuizQuestionsService } from '../sa-quiz-questions.service';
import { QuestionsViewModel } from '../../views/questions.view-model';

export class SaGetQuestionsCommand {
  constructor(public queryData: ParseQueriesDto) {}
}

@CommandHandler(SaGetQuestionsCommand)
export class SaGetQuestionsUseCase
  implements ICommandHandler<SaGetQuestionsCommand>
{
  constructor(
    protected gameQuestionsRepo: GameQuestionsRepo,
    protected quizQuestionsService: SaQuizQuestionsService,
  ) {}

  async execute(command: SaGetQuestionsCommand): Promise<PaginatorDto> {
    const { queryData } = command;
    const { pageNumber, pageSize } = queryData.queryPagination;

    const questionsAndCount: QuestionsAndCountDto =
      await this.gameQuestionsRepo.saGetQuestions(queryData);

    if (questionsAndCount.countQuestions === 0) {
      return {
        pagesCount: 0,
        page: pageNumber,
        pageSize: pageSize,
        totalCount: 0,
        items: [],
      };
    }

    const questionsModels: QuestionsViewModel[] =
      await this.quizQuestionsService.transformEntityToQuestionsModelArray(
        questionsAndCount.questions,
      );

    const totalCount = questionsAndCount.countQuestions;
    const pagesCount = Math.ceil(totalCount / pageSize);

    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: questionsModels,
    };
  }
}

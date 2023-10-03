import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ParseQueriesDto } from '../../../../common/query/dto/parse-queries.dto';
import { GameQuizRepo } from '../../../pair-game-quiz/infrastructure/game-quiz-repo';
import { TransformationService } from '../../common/transform-to-questions-model';
import { PaginatedResultDto } from '../../../../common/pagination/dto/paginated-result.dto';
import { QuestionsAndCountDto } from '../../dto/questions-and-count.dto';

export class SaGetQuestionsCommand {
  constructor(public queryData: ParseQueriesDto) {}
}

@CommandHandler(SaGetQuestionsCommand)
export class SaGetQuestionsUseCase
  implements ICommandHandler<SaGetQuestionsCommand>
{
  constructor(
    protected gameQuizRepo: GameQuizRepo,
    protected transformationService: TransformationService,
  ) {}

  async execute(command: SaGetQuestionsCommand): Promise<PaginatedResultDto> {
    const { queryData } = command;
    const { pageNumber, pageSize } = queryData.queryPagination;
    console.log(pageNumber, 'pageNumber');
    console.log(pageSize, 'pageSize');
    const questionsAndCount: QuestionsAndCountDto =
      await this.gameQuizRepo.saGetQuestions(queryData);

    if (questionsAndCount.countQuestions === 0) {
      return {
        pagesCount: 0,
        page: pageNumber,
        pageSize: pageSize,
        totalCount: 0,
        items: [],
      };
    }

    const questionsModels =
      await this.transformationService.transformEntityToQuestionsModelArray(
        questionsAndCount.questions,
      );

    const totalCount = questionsAndCount.countQuestions;
    const pagesCount = Math.ceil(totalCount / pageSize);

    console.log(pageNumber, ' page pageNumber');
    console.log(pageSize, 'pageSize');

    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: questionsModels,
    };
  }
}

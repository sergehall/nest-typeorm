import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { ParseQueriesDto } from '../../../../common/query/dto/parse-queries.dto';
import { PaginatedResultDto } from '../../../../common/pagination/dto/paginated-result.dto';
import { ReturnCommentsCountCommentsDto } from '../../../comments/dto/return-comments-count-comments.dto';
import { CommentsRepo } from '../../../comments/infrastructure/comments.repo';

export class GetCommentsByUserIdCommand {
  constructor(
    public queryData: ParseQueriesDto,
    public currentUserDto: CurrentUserDto,
  ) {}
}

@CommandHandler(GetCommentsByUserIdCommand)
export class GetCommentsByUserIdUseCase
  implements ICommandHandler<GetCommentsByUserIdCommand>
{
  constructor(
    protected commentsRepo: CommentsRepo,
    protected commandBus: CommandBus,
  ) {}
  async execute(
    command: GetCommentsByUserIdCommand,
  ): Promise<PaginatedResultDto> {
    const { queryData, currentUserDto } = command;
    const { pageNumber, pageSize } = queryData.queryPagination;

    const commentsAndCountComments: ReturnCommentsCountCommentsDto =
      await this.commentsRepo.getCommentsWithLikesByUserId(
        queryData,
        currentUserDto,
      );

    const { comments, countComments } = commentsAndCountComments;

    if (countComments === 0) {
      return {
        pagesCount: 0,
        page: pageNumber,
        pageSize: pageSize,
        totalCount: 0,
        items: [],
      };
    }

    const pagesCount = Math.ceil(
      countComments / command.queryData.queryPagination.pageSize,
    );

    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: countComments,
      items: comments,
    };
  }
}

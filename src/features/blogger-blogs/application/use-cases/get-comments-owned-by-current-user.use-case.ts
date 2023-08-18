import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { CommentsRawSqlRepository } from '../../../comments/infrastructure/comments-raw-sql.repository';
import { ParseQueriesDto } from '../../../../common/query/dto/parse-queries.dto';
import { PaginatedResultDto } from '../../../../common/pagination/dto/paginated-result.dto';
import { ReturnCommentsCountCommentsDto } from '../../../comments/dto/return-comments-count-comments.dto';

export class GetCommentsOwnedByCurrentUserCommand {
  constructor(
    public queryData: ParseQueriesDto,
    public currentUserDto: CurrentUserDto,
  ) {}
}

@CommandHandler(GetCommentsOwnedByCurrentUserCommand)
export class GetCommentsOwnedByCurrentUserUseCase
  implements ICommandHandler<GetCommentsOwnedByCurrentUserCommand>
{
  constructor(
    protected commentsRawSqlRepository: CommentsRawSqlRepository,
    protected commandBus: CommandBus,
  ) {}
  async execute(
    command: GetCommentsOwnedByCurrentUserCommand,
  ): Promise<PaginatedResultDto> {
    const { queryData, currentUserDto } = command;
    const { pageNumber, pageSize } = queryData.queryPagination;

    const commentsAndCountComments: ReturnCommentsCountCommentsDto =
      await this.commentsRawSqlRepository.findCommentsOwnedByCurrentUserAndCountLikesDislikes(
        queryData,
        currentUserDto,
      );

    const { comments, countComments } = commentsAndCountComments;

    if (comments.length === 0) {
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

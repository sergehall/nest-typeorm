import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../../users/dto/current-user.dto';
import { ParseQueriesDto } from '../../../../common/query/dto/parse-queries.dto';
import { PaginatorDto } from '../../../../common/helpers/paginator.dto';
import { CommentsRepo } from '../../../comments/infrastructure/comments.repo';
import { CommentsAndCountDto } from '../../../comments/dto/comments-and-count.dto';

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
  async execute(command: GetCommentsByUserIdCommand): Promise<PaginatorDto> {
    const { queryData, currentUserDto } = command;
    const { pageNumber, pageSize } = queryData.queryPagination;

    const commentsAndCountComments: CommentsAndCountDto =
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

import { PaginationDto } from '../../../common/pagination/dto/pagination.dto';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { ConvertFiltersForDB } from '../../../common/convert-filters/convertFiltersForDB';
import { Pagination } from '../../../common/pagination/pagination';
import { FillingCommentsDataCommand2 } from '../../../comments/application/use-cases/filling-comments-data.use-case';
import { CommentsRawSqlRepository } from '../../../comments/infrastructure/comments-raw-sql.repository';
import { TablesCommentsRawSqlEntity } from '../../../comments/entities/tables-comments-raw-sql.entity';

export class FindCommentsCurrentUserCommand {
  constructor(
    public queryPagination: PaginationDto,
    public currentUserDto: CurrentUserDto,
  ) {}
}

@CommandHandler(FindCommentsCurrentUserCommand)
export class FindCommentsCurrentUserUseCase
  implements ICommandHandler<FindCommentsCurrentUserCommand>
{
  constructor(
    protected commentsRawSqlRepository: CommentsRawSqlRepository,
    protected convertFiltersForDB: ConvertFiltersForDB,
    protected pagination: Pagination,
    protected commandBus: CommandBus,
  ) {}
  async execute(command: FindCommentsCurrentUserCommand) {
    const pagination = await this.pagination.convert(
      command.queryPagination,
      command.queryPagination.sortBy,
    );
    const postInfoBlogOwnerId = command.currentUserDto.id;
    const commentatorInfoIsBanned = false;
    const banInfoIsBanned = false;

    const comments: TablesCommentsRawSqlEntity[] =
      await this.commentsRawSqlRepository.findCommentsByBlogOwnerId(
        pagination,
        postInfoBlogOwnerId,
        commentatorInfoIsBanned,
        banInfoIsBanned,
      );
    if (comments.length === 0) {
      return {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      };
    }
    const filledComments = await this.commandBus.execute(
      new FillingCommentsDataCommand2(comments, command.currentUserDto),
    );
    const totalCountComments = await this.commentsRawSqlRepository.totalCount(
      postInfoBlogOwnerId,
      commentatorInfoIsBanned,
      banInfoIsBanned,
    );
    const pagesCount = Math.ceil(
      totalCountComments / command.queryPagination.pageSize,
    );

    return {
      pagesCount: pagesCount,
      page: command.queryPagination.pageNumber,
      pageSize: command.queryPagination.pageSize,
      totalCount: totalCountComments,
      items: filledComments,
    };
  }
}

import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { CommentsRawSqlRepository } from '../../../comments/infrastructure/comments-raw-sql.repository';
import { TablesCommentsRawSqlEntity } from '../../../comments/entities/tables-comments-raw-sql.entity';
import { FillingCommentsDataCommand } from '../../../comments/application/use-cases/filling-comments-data.use-case';
import { ParseQueryType } from '../../../common/query/parse-query';

export class FindCommentsCurrentUserCommand {
  constructor(
    public queryData: ParseQueryType,
    public currentUserDto: CurrentUserDto,
  ) {}
}

@CommandHandler(FindCommentsCurrentUserCommand)
export class FindCommentsCurrentUserUseCase
  implements ICommandHandler<FindCommentsCurrentUserCommand>
{
  constructor(
    protected commentsRawSqlRepository: CommentsRawSqlRepository,
    protected commandBus: CommandBus,
  ) {}
  async execute(command: FindCommentsCurrentUserCommand) {
    const { queryData, currentUserDto } = command;
    const { id } = currentUserDto;

    const comments: TablesCommentsRawSqlEntity[] =
      await this.commentsRawSqlRepository.findCommentsByCommentatorId(
        queryData,
        id,
      );
    if (comments.length === 0) {
      return {
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      };
    }

    const filledComments = await this.commandBus.execute(
      new FillingCommentsDataCommand(comments, command.currentUserDto),
    );

    const totalCountComments =
      await this.commentsRawSqlRepository.totalCountCommentsByCommentatorId(id);

    const pagesCount = Math.ceil(
      totalCountComments / command.queryData.queryPagination.pageSize,
    );

    return {
      pagesCount: pagesCount,
      page: command.queryData.queryPagination.pageNumber,
      pageSize: command.queryData.queryPagination.pageSize,
      totalCount: totalCountComments,
      items: filledComments,
    };
  }
}

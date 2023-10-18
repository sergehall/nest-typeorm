import { ParseQueriesDto } from '../../../../common/query/dto/parse-queries.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PaginatedResultDto } from '../../../../common/pagination/dto/paginated-result.dto';
import { UsersRepo } from '../../infrastructure/users-repo';
import { UsersEntity } from '../../entities/users.entity';

export class FindUsersCommand {
  constructor(public queryData: ParseQueriesDto) {}
}

@CommandHandler(FindUsersCommand)
export class FindUsersUseCase implements ICommandHandler<FindUsersCommand> {
  constructor(protected usersRepo: UsersRepo) {}
  async execute(command: FindUsersCommand): Promise<PaginatedResultDto> {
    const { queryData } = command;

    const users: UsersEntity[] = await this.usersRepo.findUsers(queryData);

    const totalCount = await this.usersRepo.totalCountUsers(queryData);

    const pagesCount = Math.ceil(
      totalCount / queryData.queryPagination.pageSize,
    );
    return {
      pagesCount: pagesCount,
      page: queryData.queryPagination.pageNumber,
      pageSize: queryData.queryPagination.pageSize,
      totalCount: totalCount,
      items: users,
    };
  }
}

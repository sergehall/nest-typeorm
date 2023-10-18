import { ParseQueriesDto } from '../../../../common/query/dto/parse-queries.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PaginatedResultDto } from '../../../../common/pagination/dto/paginated-result.dto';
import { UsersRepo } from '../../../users/infrastructure/users-repo';
import { UsersEntity } from '../../../users/entities/users.entity';
import { UserViewModel } from '../../../users/view-models/user.view-model';

export class SaFindUsersCommand {
  constructor(public queryData: ParseQueriesDto) {}
}

@CommandHandler(SaFindUsersCommand)
export class SaFindUsersUseCase implements ICommandHandler<SaFindUsersCommand> {
  constructor(protected usersRepo: UsersRepo) {}
  async execute(command: SaFindUsersCommand): Promise<PaginatedResultDto> {
    const { queryData } = command;

    const arrUsers = await this.usersRepo.findUsers(queryData);

    const transformedArrUsers = await this.transformedArrUsers(arrUsers);

    const totalCount = await this.usersRepo.totalCountUsers(queryData);

    const pagesCount = Math.ceil(
      totalCount / queryData.queryPagination.pageSize,
    );
    return {
      pagesCount: pagesCount,
      page: queryData.queryPagination.pageNumber,
      pageSize: queryData.queryPagination.pageSize,
      totalCount: totalCount,
      items: transformedArrUsers,
    };
  }

  private async transformedArrUsers(
    usersArr: UsersEntity[],
  ): Promise<UserViewModel[]> {
    return usersArr.map((user: UsersEntity) => ({
      id: user.userId,
      login: user.login,
      email: user.email,
      createdAt: user.createdAt,
    }));
  }
}

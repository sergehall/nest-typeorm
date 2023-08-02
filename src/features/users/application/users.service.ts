import { Injectable } from '@nestjs/common';
import { UsersRawSqlRepository } from '../infrastructure/users-raw-sql.repository';
import { ParseQueryType } from '../../common/query/parse-query';
import { ReturnUsersBanInfoEntity } from '../../sa/entities/return-users-banInfo.entity';
import { PaginationTypes } from '../../common/pagination/types/pagination.types';
import { TablesUsersWithIdEntity } from '../entities/tables-user-with-id.entity';

@Injectable()
export class UsersService {
  constructor(protected usersRawSqlRepository: UsersRawSqlRepository) {}

  async saFindUsers(queryData: ParseQueryType): Promise<PaginationTypes> {
    const arrUsers = await this.usersRawSqlRepository.saFindUsers(queryData);

    const transformedArrUsers = await this.transformedArrUsersForSa(arrUsers);

    const totalCount = await this.usersRawSqlRepository.totalCountUsersForSa(
      queryData,
    );
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

  async findUsers(queryData: ParseQueryType): Promise<PaginationTypes> {
    const users = await this.usersRawSqlRepository.findUsers(queryData);

    const totalCount = await this.usersRawSqlRepository.totalCountUsers(
      queryData,
    );
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

  async findUserByUserId(
    userId: string,
  ): Promise<TablesUsersWithIdEntity | null> {
    return await this.usersRawSqlRepository.findUserByUserId(userId);
  }

  private async transformedArrUsersForSa(
    usersArr: TablesUsersWithIdEntity[],
  ): Promise<ReturnUsersBanInfoEntity[]> {
    return usersArr.map((user: TablesUsersWithIdEntity) => ({
      id: user.id,
      login: user.login,
      email: user.email,
      createdAt: user.createdAt,
      banInfo: {
        isBanned: user.isBanned,
        banDate: user.banDate,
        banReason: user.banReason,
      },
    }));
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRawSqlRepository } from '../infrastructure/users-raw-sql.repository';
import { ReturnUsersBanInfoEntity } from '../../sa/entities/return-users-banInfo.entity';
import { PaginationTypes } from '../../common/pagination/types/pagination.types';
import { TablesUsersWithIdEntity } from '../entities/tables-user-with-id.entity';
import { ParseQueriesType } from '../../common/query/types/parse-query.types';

@Injectable()
export class UsersService {
  constructor(protected usersRawSqlRepository: UsersRawSqlRepository) {}

  async saFindUsers(queryData: ParseQueriesType): Promise<PaginationTypes> {
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

  async findUsers(queryData: ParseQueriesType): Promise<PaginationTypes> {
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

  async findUserByUserId(userId: string): Promise<TablesUsersWithIdEntity> {
    const userById: TablesUsersWithIdEntity | null =
      await this.usersRawSqlRepository.findUserByUserId(userId);

    if (!userById)
      throw new NotFoundException(`Not found user by id: ${userId}`);

    return userById;
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

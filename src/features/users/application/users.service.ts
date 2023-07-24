import { Injectable } from '@nestjs/common';
import { ConvertFiltersForDB } from '../../common/convert-filters/convertFiltersForDB';
import { Pagination } from '../../common/pagination/pagination';
import { PaginationTypes } from '../../common/pagination/types/pagination.types';
import { UsersRawSqlRepository } from '../infrastructure/users-raw-sql.repository';
import { ParseQueryType } from '../../common/parse-query/parse-query';
import { TablesUsersEntityWithId } from '../entities/userRawSqlWithId.entity';
import { ReturnUsersBanInfoEntity } from '../../sa/entities/return-users-banInfo.entity';

@Injectable()
export class UsersService {
  constructor(
    protected convertFiltersForDB: ConvertFiltersForDB,
    protected pagination: Pagination,
    protected usersRawSqlRepository: UsersRawSqlRepository,
  ) {}

  async saFindUsers(queryData: ParseQueryType): Promise<PaginationTypes> {
    const arrUsers = await this.usersRawSqlRepository.saFindUsers(queryData);

    const transformedArrUsers = await this.transformedArrUsers(arrUsers);

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
      items: transformedArrUsers,
    };
  }

  async findUsersRawSql(queryData: ParseQueryType): Promise<PaginationTypes> {
    const users = await this.usersRawSqlRepository.findUsers(queryData);

    const transformedArrUsers = await this.transformedArrUsers(users);

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
      items: transformedArrUsers,
    };
  }

  async findUserByUserId(
    userId: string,
  ): Promise<TablesUsersEntityWithId | null> {
    return await this.usersRawSqlRepository.findUserByUserId(userId);
  }

  private async transformedArrUsers(
    usersArr: TablesUsersEntityWithId[],
  ): Promise<ReturnUsersBanInfoEntity[]> {
    return usersArr.map((user: TablesUsersEntityWithId) => ({
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

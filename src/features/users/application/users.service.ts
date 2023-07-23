import { Injectable } from '@nestjs/common';
import { ConvertFiltersForDB } from '../../common/convert-filters/convertFiltersForDB';
import { Pagination } from '../../common/pagination/pagination';
import { PaginationTypes } from '../../common/pagination/types/pagination.types';
import { UsersRawSqlRepository } from '../infrastructure/users-raw-sql.repository';
import { ParseQueryType } from '../../common/parse-query/parse-query';
import { TablesUsersEntityWithId } from '../entities/userRawSqlWithId.entity';

@Injectable()
export class UsersService {
  constructor(
    protected convertFiltersForDB: ConvertFiltersForDB,
    protected pagination: Pagination,
    protected usersRawSqlRepository: UsersRawSqlRepository,
  ) {}

  async findUsersRawSql(queryData: ParseQueryType): Promise<PaginationTypes> {
    const field = queryData.queryPagination.sortBy;
    const pagination = await this.pagination.convert(
      {
        pageNumber: queryData.queryPagination.pageNumber,
        pageSize: queryData.queryPagination.pageSize,
        sortBy: queryData.queryPagination.sortBy,
        sortDirection: queryData.queryPagination.sortDirection,
      },
      field,
    );
    const users = await this.usersRawSqlRepository.findUsers(queryData);
    const transformedArrUsers = users.map((i) => ({
      id: i.id,
      login: i.login,
      email: i.email,
      createdAt: i.createdAt,
      banInfo: {
        isBanned: i.isBanned,
        banDate: i.banDate,
        banReason: i.banReason,
      },
    }));
    const totalCount = await this.usersRawSqlRepository.totalCountUsers(
      pagination,
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
}

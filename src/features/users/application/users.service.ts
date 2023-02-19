import { Injectable } from '@nestjs/common';
import { PaginationDto } from '../../common/pagination/dto/pagination.dto';
import { ConvertFiltersForDB } from '../../common/convert-filters/convertFiltersForDB';
import { Pagination } from '../../common/pagination/pagination';
import { UsersRepository } from '../infrastructure/users.repository';
import { PaginationTypes } from '../../common/pagination/types/pagination.types';
import { UsersEntity } from '../entities/users.entity';
import { QueryArrType } from '../../common/convert-filters/types/convert-filter.types';

@Injectable()
export class UsersService {
  constructor(
    protected convertFiltersForDB: ConvertFiltersForDB,
    protected pagination: Pagination,
    protected usersRepository: UsersRepository,
  ) {}

  async findUserByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<UsersEntity | null> {
    return await this.usersRepository.findUserByLoginOrEmail(loginOrEmail);
  }

  async findUsers(
    queryPagination: PaginationDto,
    searchFilters: QueryArrType,
  ): Promise<PaginationTypes> {
    const field = queryPagination.sortBy;
    const convertedFilters = await this.convertFiltersForDB.convert(
      searchFilters,
    );
    const pagination = await this.pagination.convert(queryPagination, field);
    const posts = await this.usersRepository.findUsers(
      pagination,
      convertedFilters,
    );
    const totalCount = await this.usersRepository.countDocuments(
      convertedFilters,
    );
    const pagesCount = Math.ceil(totalCount / queryPagination.pageSize);
    return {
      pagesCount: pagesCount,
      page: queryPagination.pageNumber,
      pageSize: queryPagination.pageSize,
      totalCount: totalCount,
      items: posts,
    };
  }

  async findUserByUserId(userId: string): Promise<UsersEntity | null> {
    return await this.usersRepository.findUserByUserId(userId);
  }
}

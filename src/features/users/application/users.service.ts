import { Injectable } from '@nestjs/common';
import { PaginationDto } from '../../common/pagination/dto/pagination.dto';
import { ConvertFiltersForDB } from '../../common/convert-filters/convertFiltersForDB';
import { Pagination } from '../../common/pagination/pagination';
import { UsersRepository } from '../infrastructure/users.repository';
import { PaginationTypes } from '../../common/pagination/types/pagination.types';
import { QueryArrType } from '../../common/convert-filters/types/convert-filter.types';
import { CreateUserDto } from '../dto/create-user.dto';
import { RegDataDto } from '../dto/reg-data.dto';
import { UsersRawSqlRepository } from '../infrastructure/users-raw-sql.repository';
import * as uuid4 from 'uuid4';
import * as bcrypt from 'bcrypt';
import { OrgIdEnums } from '../enums/org-id.enums';
import { RolesEnums } from '../../../ability/enums/roles.enums';
import { TablesUsersEntity } from '../entities/tablesUsers.entity';
import { ParseQueryType } from '../../common/parse-query/parse-query';
import { TablesUsersEntityWithId } from '../entities/userRawSqlWithId.entity';

@Injectable()
export class UsersService {
  constructor(
    protected convertFiltersForDB: ConvertFiltersForDB,
    protected pagination: Pagination,
    protected usersRepository: UsersRepository,
    protected usersRawSqlRepository: UsersRawSqlRepository,
  ) {}
  async createUsers(
    createUserDto: CreateUserDto,
    regDataDto: RegDataDto,
  ): Promise<TablesUsersEntityWithId> {
    const passwordHash = await bcrypt.hash(
      createUserDto.password,
      await bcrypt.genSalt(Number(process.env.SALT_FACTOR)),
    );
    const newUser: TablesUsersEntity = {
      login: createUserDto.login.toLowerCase(),
      email: createUserDto.email.toLowerCase(),
      passwordHash: passwordHash,
      createdAt: new Date().toISOString(),
      orgId: OrgIdEnums.IT_INCUBATOR,
      roles: RolesEnums.USER,
      isBanned: false,
      banDate: null,
      banReason: null,
      confirmationCode: uuid4().toString(),
      expirationDate: new Date(Date.now() + 65 * 60 * 1000).toISOString(),
      isConfirmed: false,
      isConfirmedDate: null,
      ip: regDataDto.ip,
      userAgent: regDataDto.userAgent,
    };
    return await this.usersRawSqlRepository.createUser(newUser);
  }

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

  async findUsers(
    queryPagination: PaginationDto,
    searchFilters: QueryArrType,
  ): Promise<PaginationTypes> {
    const field = queryPagination.sortBy;
    const convertedFilters = await this.convertFiltersForDB.convert(
      searchFilters,
    );
    const pagination = await this.pagination.convert(queryPagination, field);
    const users = await this.usersRepository.findUsers(
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
      items: users,
    };
  }

  async findUserByUserId(
    userId: string,
  ): Promise<TablesUsersEntityWithId | null> {
    return await this.usersRawSqlRepository.findUserByUserId(userId);
  }
}

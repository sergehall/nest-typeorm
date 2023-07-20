import { Injectable } from '@nestjs/common';
import { ConvertFiltersForDB } from '../../common/convert-filters/convertFiltersForDB';
import { Pagination } from '../../common/pagination/pagination';
import { PaginationTypes } from '../../common/pagination/types/pagination.types';
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
import { getConfiguration } from '../../../config/configuration';

@Injectable()
export class UsersService {
  constructor(
    protected convertFiltersForDB: ConvertFiltersForDB,
    protected pagination: Pagination,
    protected usersRawSqlRepository: UsersRawSqlRepository,
  ) {}
  async createUsers(
    createUserDto: CreateUserDto,
    regDataDto: RegDataDto,
  ): Promise<TablesUsersEntityWithId> {
    const { login, email, password } = createUserDto;
    // Hash the user's password
    const passwordHash = await this.hashPassword(password);

    // Prepare the user object with the necessary properties
    const newUser: TablesUsersEntity = {
      login: login.toLowerCase(),
      email: email.toLowerCase(),
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
    // Call the repository method to create the user and return the result
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

  async findUserByUserId(
    userId: string,
  ): Promise<TablesUsersEntityWithId | null> {
    return await this.usersRawSqlRepository.findUserByUserId(userId);
  }

  private async hashPassword(password: string): Promise<string> {
    const saltFactor = Number(getConfiguration().bcrypt.SALT_FACTOR);
    const salt = await bcrypt.genSalt(saltFactor);
    return bcrypt.hash(password, salt);
  }
}

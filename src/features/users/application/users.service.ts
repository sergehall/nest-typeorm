import { Injectable } from '@nestjs/common';
import { PaginationDto } from '../../common/pagination/dto/pagination.dto';
import { ConvertFiltersForDB } from '../../common/convert-filters/convertFiltersForDB';
import { Pagination } from '../../common/pagination/pagination';
import { UsersRepository } from '../infrastructure/users.repository';
import { PaginationTypes } from '../../common/pagination/types/pagination.types';
import { UsersEntity } from '../entities/users.entity';
import { QueryArrType } from '../../common/convert-filters/types/convert-filter.types';
import { CreateUserDto } from '../dto/create-user.dto';
import { RegDataDto } from '../dto/reg-data.dto';
import { UsersRawSqlRepository } from '../infrastructure/users-raw-sql.repository';
import * as uuid4 from 'uuid4';
import * as bcrypt from 'bcrypt';
import { OrgIdEnums } from '../enums/org-id.enums';
import { RolesEnums } from '../../../ability/enums/roles.enums';
import { UsersRawSqlEntity } from '../entities/usersRawSql.entity';
import { UserRawSqlWithIdEntity } from '../entities/userRawSqlWithId.entity';

@Injectable()
export class UsersService {
  constructor(
    protected convertFiltersForDB: ConvertFiltersForDB,
    protected pagination: Pagination,
    protected usersRepository: UsersRepository,
    protected usersSqlRepository: UsersRawSqlRepository,
  ) {}
  async createUsers(
    createUserDto: CreateUserDto,
    regDataDto: RegDataDto,
  ): Promise<UserRawSqlWithIdEntity> {
    const createUserRawSql: UsersRawSqlEntity = {
      login: createUserDto.login,
      email: createUserDto.email,
      passwordHash: await bcrypt.hash(
        createUserDto.password,
        await bcrypt.genSalt(Number(process.env.SALT_FACTOR)),
      ),
      createdAt: new Date().toISOString(),
      orgId: OrgIdEnums.IT_INCUBATOR,
      roles: RolesEnums.USER,
      banInfo: {
        isBanned: false,
        banDate: null,
        banReason: null,
      },
      emailConfirmation: {
        confirmationCode: uuid4().toString(),
        expirationDate: new Date(Date.now() + 65 * 60 * 1000).toISOString(),
        isConfirmed: false,
        isConfirmedDate: null,
      },
      registrationData: {
        ip: regDataDto.ip,
        userAgent: regDataDto.userAgent,
      },
    };

    return await this.usersSqlRepository.createUser(createUserRawSql);
  }

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

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UsersRawSqlEntity } from '../entities/usersRawSql.entity';
import { UserRawSqlWithIdEntity } from '../entities/userRawSqlWithId.entity';
import { TablesUsersEntity } from '../entities/tablesUsers.entity';
import { PaginationDBType } from '../../common/pagination/types/pagination.types';
import { ParseQueryType } from '../../common/parse-query/parse-query';
import { RolesEnums } from '../../../ability/enums/roles.enums';

@Injectable()
export class UsersRawSqlRepository {
  constructor(@InjectDataSource() private readonly db: DataSource) {}

  async createUser(
    createUserRawSql: UsersRawSqlEntity,
  ): Promise<UserRawSqlWithIdEntity> {
    try {
      const insertNewUser = await this.db.query(
        `
        INSERT INTO public."Users"
        ( "login", 
          "email", 
          "passwordHash", 
          "createdAt", 
          "orgId", 
          "roles", 
          "isBanned", 
          "banDate", 
          "banReason", 
          "confirmationCode", 
          "expirationDate", 
          "isConfirmed", 
          "isConfirmedDate",
          "ip",
          "userAgent")
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
          returning id`,
        [
          createUserRawSql.login,
          createUserRawSql.email,
          createUserRawSql.passwordHash,
          createUserRawSql.createdAt,
          createUserRawSql.orgId,
          createUserRawSql.roles,
          createUserRawSql.banInfo.isBanned,
          createUserRawSql.banInfo.banDate,
          createUserRawSql.banInfo.banReason,
          createUserRawSql.emailConfirmation.confirmationCode,
          createUserRawSql.emailConfirmation.expirationDate,
          createUserRawSql.emailConfirmation.isConfirmed,
          createUserRawSql.emailConfirmation.isConfirmedDate,
          createUserRawSql.registrationData.ip,
          createUserRawSql.registrationData.userAgent,
        ],
      );
      return { id: insertNewUser[0].id, ...createUserRawSql };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async changeRole(
    userId: string,
    roles: RolesEnums,
  ): Promise<TablesUsersEntity> {
    try {
      const updateUserRole = await this.db.query(
        `
      UPDATE public."Users"
      SET  "roles" = $2
      WHERE "id" = $1
      returning *`,
        [userId, roles],
      );
      return updateUserRole[0][0];
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
  async findUserByConfirmationCode(
    confirmationCode: string,
  ): Promise<TablesUsersEntity | null> {
    try {
      const user = await this.db.query(
        `
      SELECT "id", "login", "email", "passwordHash", "createdAt", "orgId", "roles", "isBanned", "banDate", "banReason", "confirmationCode", "expirationDate", "isConfirmed", "isConfirmedDate", "ip", "userAgent"
      FROM public."Users"
      WHERE "confirmationCode" = $1`,
        [confirmationCode],
      );
      return user[0] ? user[0] : null;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findUserByUserId(userId: string): Promise<TablesUsersEntity | null> {
    try {
      const user = await this.db.query(
        `
      SELECT "id", "login", "email", "passwordHash", "createdAt", "orgId", "roles", "isBanned", "banDate", "banReason", "confirmationCode", "expirationDate", "isConfirmed", "isConfirmedDate", "ip", "userAgent"
      FROM public."Users"
      WHERE "id" = $1`,
        [userId],
      );
      return user[0] ? user[0] : null;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
  async confirmUserByConfirmCode(
    confirmationCode: string,
    isConfirmed: boolean,
    isConfirmedDate: string,
  ): Promise<boolean> {
    try {
      const user = await this.db.query(
        `
      UPDATE public."Users"
      SET  "isConfirmed" = $2, "isConfirmedDate" = $3
      WHERE "confirmationCode" = $1`,
        [confirmationCode, isConfirmed, isConfirmedDate],
      );
      return !!user[0];
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateUserConfirmationCode(
    user: UserRawSqlWithIdEntity,
  ): Promise<boolean> {
    try {
      const updateUser = await this.db.query(
        `
      UPDATE public."Users"
      SET  "confirmationCode" = $2, "expirationDate" = $3
      WHERE "confirmationCode" = $1`,
        [
          user.id,
          user.emailConfirmation.confirmationCode,
          user.emailConfirmation.expirationDate,
        ],
      );
      return !!updateUser[0];
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findUserByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<TablesUsersEntity | null> {
    try {
      const user = await this.db.query(
        `
        SELECT "id", "login", "email", "passwordHash", "createdAt", "orgId", "roles", "isBanned", "banDate", "banReason", "confirmationCode", "expirationDate", "isConfirmed", "isConfirmedDate", "ip", "userAgent"
        FROM public."Users"
        WHERE "email" = $1 or "login" = $1
      `,
        [loginOrEmail],
      );
      if (user[0]) {
        return user[0];
      } else {
        return null;
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
  async findUsers(
    pagination: PaginationDBType,
    queryData: ParseQueryType,
  ): Promise<TablesUsersEntity[]> {
    try {
      const preparedQuery = await this._prepQueryRawSql(pagination, queryData);
      return await this.db.query(
        `
        SELECT "id", "login", "email", "createdAt", "isBanned", "banDate", "banReason"
        FROM public."Users"
        WHERE "email" like $1 OR "login" like $2
        AND  "isBanned" in (${preparedQuery.banCondition})
        ORDER BY $3
        LIMIT $4 OFFSET $5
      `,
        [
          preparedQuery.searchEmailTerm,
          preparedQuery.searchLoginTerm,
          preparedQuery.orderByWithDirection,
          pagination.pageSize,
          pagination.startIndex,
        ],
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
  async totalCountUsers(
    pagination: PaginationDBType,
    queryData: ParseQueryType,
  ): Promise<number> {
    try {
      const preparedQuery = await this._prepQueryRawSql(pagination, queryData);
      const totalCount = await this.db.query(
        `
        SELECT count(*)
        FROM public."Users"
        WHERE "email" like $1 OR "login" like $2
        AND  "isBanned" in (${preparedQuery.banCondition})
      `,
        [preparedQuery.searchEmailTerm, preparedQuery.searchLoginTerm],
      );
      return Number(totalCount[0].count);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async _prepQueryRawSql(
    pagination: PaginationDBType,
    queryData: ParseQueryType,
  ) {
    try {
      const direction = [-1, 'ascending', 'asc'].includes(pagination.direction)
        ? 'asc'
        : 'desc';

      const orderByWithDirection = `"${pagination.field}" ${direction}`;
      const banCondition =
        queryData.banStatus === ''
          ? [true, false]
          : queryData.banStatus === 'true'
          ? [true]
          : [false];
      const searchEmailTerm =
        queryData.searchEmailTerm.toLocaleLowerCase().length !== 0
          ? `%${queryData.searchEmailTerm.toLocaleLowerCase()}%`
          : '';
      let searchLoginTerm =
        queryData.searchLoginTerm.toLocaleLowerCase().length !== 0
          ? `%${queryData.searchLoginTerm.toLocaleLowerCase()}%`
          : '';
      if (searchEmailTerm.length + searchLoginTerm.length === 0) {
        searchLoginTerm = '%%';
      }
      return {
        orderByWithDirection: orderByWithDirection,
        banCondition: banCondition,
        searchEmailTerm: searchEmailTerm,
        searchLoginTerm: searchLoginTerm,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}

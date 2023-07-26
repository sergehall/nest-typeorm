import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TablesUsersEntity } from '../entities/tablesUsers.entity';
import { ParseQueryType } from '../../common/parse-query/parse-query';
import { RolesEnums } from '../../../ability/enums/roles.enums';
import { TablesUsersEntityWithId } from '../entities/userRawSqlWithId.entity';
import { BanInfoDto } from '../dto/banInfo.dto';

@Injectable()
export class UsersRawSqlRepository {
  constructor(@InjectDataSource() private readonly db: DataSource) {}

  async saFindUsers(
    queryData: ParseQueryType,
  ): Promise<TablesUsersEntityWithId[]> {
    try {
      const preparedQuery = await this.prepQueryRawSql(queryData);
      const limit = queryData.queryPagination.pageSize;
      const offset = queryData.queryPagination.pageNumber - 1;
      return await this.db.query(
        `
        SELECT "userId" as "id", "login", "email", "createdAt", "isBanned", "banDate", "banReason"
        FROM public."Users"
        WHERE "email" like $1 OR "login" like $2
        ORDER BY "${queryData.queryPagination.sortBy}" ${preparedQuery.direction}
        LIMIT $3 OFFSET $4
      `,
        [
          preparedQuery.searchEmailTerm,
          preparedQuery.searchLoginTerm,
          limit,
          offset,
        ],
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findUserByUserId(
    userId: string,
  ): Promise<TablesUsersEntityWithId | null> {
    const isBanned = false;
    try {
      const user = await this.db.query(
        `
        SELECT "userId" AS "id", "login", "email", "passwordHash", "createdAt", 
        "orgId", "roles", "isBanned", "banDate", "banReason", "confirmationCode",
        "expirationDate", "isConfirmed", "isConfirmedDate", "ip", "userAgent"
        FROM public."Users"
        WHERE "userId" = $1 AND "isBanned" = $2
      `,
        [userId, isBanned],
      );
      return user[0];
    } catch (error) {
      console.log(error.message);
      return null;
    }
  }

  async saFindUserByUserId(
    userId: string,
  ): Promise<TablesUsersEntityWithId | null> {
    try {
      const user = await this.db.query(
        `
      SELECT "userId" AS "id", "login", "email", "passwordHash", "createdAt", 
      "orgId", "roles", "isBanned", "banDate", "banReason", "confirmationCode",
      "expirationDate", "isConfirmed", "isConfirmedDate", "ip", "userAgent"
      FROM public."Users"
      WHERE "userId" = $1`,
        [userId],
      );
      return user[0];
    } catch (error) {
      console.log(error.message);
      return null;
    }
  }

  async findUsers(
    queryData: ParseQueryType,
  ): Promise<TablesUsersEntityWithId[]> {
    try {
      const preparedQuery = await this.prepQueryRawSql(queryData);
      const limit = queryData.queryPagination.pageSize;
      const offset = queryData.queryPagination.pageNumber - 1;
      const isBanned = false;
      return await this.db.query(
        `
      SELECT "userId" as "id", "login", "email", "createdAt"
      FROM public."Users"
      WHERE "email" LIKE $1 OR "login" LIKE $2 AND "isBanned" = $3
      ORDER BY "${queryData.queryPagination.sortBy}" ${preparedQuery.direction}
      LIMIT $4 OFFSET $5
    `,
        [
          preparedQuery.searchEmailTerm,
          preparedQuery.searchLoginTerm,
          isBanned,
          limit,
          offset,
        ],
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findUserByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<TablesUsersEntityWithId | null> {
    try {
      const user = await this.db.query(
        `
        SELECT "userId" as "id", "login", "email", "passwordHash", "createdAt", "orgId", "roles", 
        "isBanned", "banDate", "banReason", "confirmationCode", "expirationDate", "isConfirmed",
         "isConfirmedDate", "ip", "userAgent"
        FROM public."Users"
        WHERE "email" = $1 or "login" = $1
      `,
        [loginOrEmail.toLocaleLowerCase()],
      );
      return user[0] ? user[0] : null;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async createUser(
    tablesUsersEntity: TablesUsersEntity,
  ): Promise<TablesUsersEntityWithId> {
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
          RETURNING "userId" AS "id"`,
        [
          tablesUsersEntity.login,
          tablesUsersEntity.email,
          tablesUsersEntity.passwordHash,
          tablesUsersEntity.createdAt,
          tablesUsersEntity.orgId,
          tablesUsersEntity.roles,
          tablesUsersEntity.isBanned,
          tablesUsersEntity.banDate,
          tablesUsersEntity.banReason,
          tablesUsersEntity.confirmationCode,
          tablesUsersEntity.expirationDate,
          tablesUsersEntity.isConfirmed,
          tablesUsersEntity.isConfirmedDate,
          tablesUsersEntity.ip,
          tablesUsersEntity.userAgent,
        ],
      );
      return { id: insertNewUser[0].id, ...tablesUsersEntity };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findUserByConfirmationCode(
    confirmationCode: string,
  ): Promise<TablesUsersEntityWithId | null> {
    try {
      const currentTime = new Date().toISOString();
      const query = `
        SELECT 
        "userId" AS "id", "login", "email", "passwordHash", "createdAt", 
        "orgId", "roles", "isBanned", "banDate", "banReason", "confirmationCode", 
        "expirationDate", "isConfirmed", "isConfirmedDate", "ip", "userAgent"
        FROM public."Users"
        WHERE "confirmationCode" = $1
        AND (
          ("isConfirmed" = false AND "expirationDate" > $2)
          OR "isConfirmed" = true
        )
        `;
      const user = await this.db.query(query, [confirmationCode, currentTime]);
      return user[0] || null;
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
    email: string,
    confirmationCode: string,
    expirationDate: string,
  ): Promise<TablesUsersEntityWithId[]> {
    try {
      const updateUser = await this.db.query(
        `
      UPDATE public."Users"
      SET  "confirmationCode" = $2, "expirationDate" = $3
      WHERE "email" = $1
      RETURNING *`,
        [email, confirmationCode, expirationDate],
      );
      return updateUser[0];
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateUserPasswordHashByRecoveryCode(
    recoveryCode: string,
    newPasswordHash: string,
  ): Promise<TablesUsersEntityWithId[]> {
    try {
      const updateUserPassword = await this.db.query(
        `
      UPDATE public."Users"
      SET  "passwordHash" = $2
      WHERE "confirmationCode" = $1
      RETURNING *`,
        [recoveryCode, newPasswordHash],
      );
      return updateUserPassword[0];
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async userAlreadyExist(
    login: string,
    email: string,
  ): Promise<TablesUsersEntity | null> {
    try {
      const user = await this.db.query(
        `
        SELECT "userId", "login", "email", "passwordHash", "createdAt", "orgId",
         "roles", "isBanned", "banDate", "banReason", "confirmationCode", 
         "expirationDate", "isConfirmed", "isConfirmedDate", "ip", "userAgent"
        FROM public."Users"
        WHERE "login" = $1 OR "email" = $2
      `,
        [login.toLocaleLowerCase(), email.toLocaleLowerCase()],
      );
      return user[0] ? user[0] : null;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async totalCountUsersForSa(queryData: ParseQueryType): Promise<number> {
    try {
      const preparedQuery = await this.prepQueryRawSql(queryData);
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

  async totalCountUsers(queryData: ParseQueryType): Promise<number> {
    try {
      const preparedQuery = await this.prepQueryRawSql(queryData);
      const isBanned = false;
      const totalCount = await this.db.query(
        `
        SELECT count(*)
        FROM public."Users"
        WHERE "email" like $1 OR "login" like $2 AND  "isBanned" = $3
        `,
        [
          preparedQuery.searchEmailTerm,
          preparedQuery.searchLoginTerm,
          isBanned,
        ],
      );
      return Number(totalCount[0].count);
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
      WHERE "userId" = $1
      RETURNING *`,
        [userId, roles],
      );
      return updateUserRole[0][0];
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async banUser(userId: string, banInfo: BanInfoDto): Promise<boolean> {
    try {
      const { isBanned, banReason, banDate } = banInfo;
      const updatePosts = await this.db.query(
        `
      UPDATE public."Users"
      SET  "isBanned" = $2, "banDate" = $3, "banReason" = $4
      WHERE "userId" = $1`,
        [userId, isBanned, banDate, banReason],
      );
      return !!updatePosts[0];
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getOldestUserWithExpirationDate() {
    try {
      const isConfirmed = true;
      const currentTime = new Date().toISOString();
      const orderByDirection = `"createdAt" DESC`;
      const limit = 1;
      const offset = 0;
      return await this.db.query(
        `
      SELECT "userId" AS "id"
      FROM public."Users"
      WHERE "isConfirmed" <> $1 AND "expirationDate" <= $2
      ORDER BY ${orderByDirection}
      LIMIT $3 OFFSET $4
      `,
        [isConfirmed, currentTime, limit, offset],
      );
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async removeUserByUserId(userId: string): Promise<boolean> {
    try {
      return await this.db.query(
        `
        DELETE FROM public."Users"
        WHERE "userId" = $1
          `,
        [userId],
      );
    } catch (error) {
      console.log(error.message);
      throw new NotFoundException(error.message);
    }
  }

  private async prepQueryRawSql(queryData: ParseQueryType) {
    try {
      const direction = [-1, 'ascending', 'ASCENDING', 'asc', 'ASC'].includes(
        queryData.queryPagination.sortDirection,
      )
        ? 'ASC'
        : 'DESC';

      const orderByWithDirection = `"${queryData.queryPagination.sortBy}" ${direction}`;
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
        direction: direction,
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

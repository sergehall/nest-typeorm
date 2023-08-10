import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TablesUsersEntity } from '../entities/tables-users.entity';
import { RolesEnums } from '../../../ability/enums/roles.enums';
import { BanInfoDto } from '../dto/banInfo.dto';
import { TablesUsersWithIdEntity } from '../entities/tables-user-with-id.entity';
import { ParseQueriesType } from '../../common/query/types/parse-query.types';
import { KeyArrayProcessor } from '../../common/query/get-key-from-array-or-default';
import { loginOrEmailAlreadyExists } from '../../../exception-filter/custom-errors-messages';

@Injectable()
export class UsersRawSqlRepository {
  constructor(
    @InjectDataSource() private readonly db: DataSource,
    protected keyArrayProcessor: KeyArrayProcessor,
  ) {}

  async saFindUsers(
    queryData: ParseQueriesType,
  ): Promise<TablesUsersWithIdEntity[]> {
    try {
      const searchEmailTerm = queryData.searchEmailTerm;
      const searchLoginTerm = queryData.searchLoginTerm;
      const banCondition = queryData.banStatus;
      const sortBy = await this.getSortBy(queryData.queryPagination.sortBy);
      const direction = queryData.queryPagination.sortDirection;
      const limit = queryData.queryPagination.pageSize;
      const offset =
        (queryData.queryPagination.pageNumber - 1) *
        queryData.queryPagination.pageSize;

      return await this.db.query(
        `
        SELECT "userId" AS "id", "login", "email", "passwordHash", "createdAt", 
        "orgId", "roles", "isBanned", "banDate", "banReason", "confirmationCode",
        "expirationDate", "isConfirmed", "isConfirmedDate", "ip", "userAgent"
        FROM public."Users"
        WHERE ("email" LIKE $1 OR "login" LIKE $2) AND "isBanned" in (${banCondition})
        ORDER BY "${sortBy}" ${direction}
        LIMIT $3 OFFSET $4
      `,
        [searchEmailTerm, searchLoginTerm, limit, offset],
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findUserByUserId(
    userId: string,
  ): Promise<TablesUsersWithIdEntity | null> {
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
  ): Promise<TablesUsersWithIdEntity | null> {
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
    queryData: ParseQueriesType,
  ): Promise<TablesUsersWithIdEntity[]> {
    try {
      const searchEmailTerm = queryData.searchEmailTerm;
      const searchLoginTerm = queryData.searchLoginTerm;
      const banCondition = queryData.banStatus;
      const sortBy = await this.getSortBy(queryData.queryPagination.sortBy);
      const direction = queryData.queryPagination.sortDirection;
      const limit = queryData.queryPagination.pageSize;
      const offset = (queryData.queryPagination.pageNumber - 1) * limit;

      return await this.db.query(
        `
      SELECT "userId" as "id", "login", "email", "createdAt"
      FROM public."Users"
      WHERE "email" LIKE $1 OR "login" LIKE $2 AND "isBanned" in (${banCondition})
      ORDER BY "${sortBy}" ${direction}
      LIMIT $3 OFFSET $4
    `,
        [searchEmailTerm, searchLoginTerm, limit, offset],
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findUserByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<TablesUsersWithIdEntity | null> {
    try {
      const user = await this.db.query(
        `
        SELECT "userId" as "id", "login", "email", "passwordHash", "createdAt", "orgId", "roles", 
        "isBanned", "banDate", "banReason", "confirmationCode", "expirationDate", "isConfirmed",
         "isConfirmedDate", "ip", "userAgent"
        FROM public."Users"
        WHERE "email" = $1 OR "login" = $1
      `,
        [loginOrEmail],
      );
      return user[0] ? user[0] : null;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async createUser(
    tablesUsersEntity: TablesUsersEntity,
  ): Promise<TablesUsersWithIdEntity> {
    try {
      const query = `
        INSERT INTO public."Users" 
        ( "login", "email", "passwordHash", "createdAt", "orgId", "roles", 
          "isBanned", "banDate", "banReason", "confirmationCode", "expirationDate", 
          "isConfirmed", "isConfirmedDate", "ip", "userAgent")
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
          RETURNING "userId" AS "id"
          `;

      const parameters = [
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
      ];

      const insertNewUser = await this.db.query(query, parameters);

      // Because I delegated the creation of the user ID to the database itself.
      return { id: insertNewUser[0].id, ...tablesUsersEntity };
    } catch (error) {
      if (
        error.message.includes('duplicate key value violates unique constraint')
      ) {
        loginOrEmailAlreadyExists.field = error.message.match(/"(.*?)"/)[1];
        throw new HttpException(
          { message: [loginOrEmailAlreadyExists] },
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async findUserByConfirmationCode(
    confirmationCode: string,
  ): Promise<TablesUsersWithIdEntity | null> {
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
      WHERE "confirmationCode" = $1
      `,
        [confirmationCode, isConfirmed, isConfirmedDate],
      );
      return user[1] === 1;
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateUserConfirmationCodeByEmail(
    email: string,
    confirmationCode: string,
    expirationDate: string,
  ): Promise<TablesUsersWithIdEntity[]> {
    try {
      const updateUser = await this.db.query(
        `
      UPDATE public."Users"
      SET "confirmationCode" = $2, "expirationDate" = $3
      WHERE "email" = $1
      RETURNING *
      `,
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
  ): Promise<TablesUsersWithIdEntity[]> {
    try {
      const updateUserPassword = await this.db.query(
        `
      UPDATE public."Users"
      SET  "passwordHash" = $2
      WHERE "confirmationCode" = $1
      RETURNING *
      `,
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
  ): Promise<TablesUsersWithIdEntity[]> {
    try {
      return await this.db.query(
        `
        SELECT "userId", "login", "email", "passwordHash", "createdAt", "orgId",
         "roles", "isBanned", "banDate", "banReason", "confirmationCode", 
         "expirationDate", "isConfirmed", "isConfirmedDate", "ip", "userAgent"
        FROM public."Users"
        WHERE "login" = $1 OR "email" = $2
      `,
        [login.toLocaleLowerCase(), email.toLocaleLowerCase()],
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async totalCountUsersForSa(queryData: ParseQueriesType): Promise<number> {
    try {
      const searchEmailTerm = queryData.searchEmailTerm;
      const searchLoginTerm = queryData.searchLoginTerm;
      const banCondition = queryData.banStatus;

      const totalCount = await this.db.query(
        `
        SELECT count(*)
        FROM public."Users"
        WHERE ("email" like $1 OR "login" like $2) AND "isBanned" in (${banCondition})
      `,
        [searchEmailTerm, searchLoginTerm],
      );
      return Number(totalCount[0].count);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async totalCountUsers(queryData: ParseQueriesType): Promise<number> {
    try {
      const searchEmailTerm = queryData.searchEmailTerm;
      const searchLoginTerm = queryData.searchLoginTerm;
      const banCondition = queryData.banStatus;

      const totalCount = await this.db.query(
        `
        SELECT count(*)
        FROM public."Users"
        WHERE "email" like $1 OR "login" like $2 AND "isBanned" in (${banCondition})
        `,
        [searchEmailTerm, searchLoginTerm],
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
      RETURNING "userId" AS "id", "login", "email", "createdAt", "isBanned", "banDate", "banReason"
      `,
        [userId, roles],
      );
      return updateUserRole[0][0];
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async banUnbanUser(userId: string, banInfo: BanInfoDto): Promise<boolean> {
    try {
      const { isBanned, banReason, banDate } = banInfo;

      const updateUser = await this.db.query(
        `
      UPDATE public."Users"
      SET  "isBanned" = $2, "banDate" = $3, "banReason" = $4
      WHERE "userId" = $1
      `,
        [userId, isBanned, banDate, banReason],
      );
      return updateUser[1] === 1;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async removeUserByUserId(userId: string): Promise<boolean> {
    try {
      const deleteUserByUseId = await this.db.query(
        `
        DELETE FROM public."Users"
        WHERE "userId" = $1
          `,
        [userId],
      );
      return deleteUserByUseId[1] === 1;
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async getOldestUsersWithExpirationDate(
    countExpiredDate: number,
  ): Promise<TablesUsersWithIdEntity[]> {
    try {
      const isConfirmed = true;
      const currentTime = new Date().toISOString();
      const orderByDirection = `"createdAt" DESC`;
      const limit = countExpiredDate;
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

  async totalCountOldestUsersWithExpirationDate(): Promise<number> {
    const isConfirmed = true;
    const currentTime = new Date().toISOString();
    try {
      const countBlogs = await this.db.query(
        `
        SELECT count(*)
        FROM public."Users"
        WHERE "isConfirmed" <> $1 AND "expirationDate" <= $2
      `,
        [isConfirmed, currentTime],
      );
      return Number(countBlogs[0].count);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  private async getSortBy(sortBy: string): Promise<string> {
    return await this.keyArrayProcessor.getKeyFromArrayOrDefault(
      sortBy,
      [
        'userId',
        'login',
        'email',
        'orgId',
        'roles',
        'isBanned',
        'banDate',
        'banReason',
        'expirationDate',
        'isConfirmed',
        'isConfirmedDate',
        'ip',
        'userAgent',
      ],
      'createdAt',
    );
  }

  async saBanUnbanUser(userId: string, banInfo: BanInfoDto): Promise<boolean> {
    const { isBanned, banReason, banDate } = banInfo;
    try {
      await this.db.transaction(async (client) => {
        await client.query(
          `
      UPDATE public."Comments"
      SET "commentatorInfoIsBanned" = $2
      WHERE "commentatorInfoUserId" = $1 OR "postInfoBlogOwnerId" = $1
      `,
          [userId, isBanned],
        );

        await client.query(
          `
      UPDATE public."LikeStatusComments"
      SET "isBanned" = $2
      WHERE "userId" = $1 OR "commentOwnerId" = $1
      `,
          [userId, isBanned],
        );

        await client.query(
          `
      UPDATE public."Posts"
      SET "dependencyIsBanned" = $2
      WHERE "postOwnerId" = $1
      `,
          [userId, isBanned],
        );

        await client.query(
          `
      UPDATE public."LikeStatusPosts"
      SET "isBanned" = $2
      WHERE "userId" = $1 OR "postOwnerId" = $1
      `,
          [userId, isBanned],
        );

        await client.query(
          `
      UPDATE public."BloggerBlogs"
      SET "dependencyIsBanned" = $2
      WHERE "blogOwnerId" = $1
      `,
          [userId, isBanned],
        );

        await client.query(
          `
      DELETE FROM public."SecurityDevices"
      WHERE "userId" = $1
      RETURNING "userId"
      `,
          [userId],
        );

        await client.query(
          `
      UPDATE public."Users"
      SET  "isBanned" = $2, "banDate" = $3, "banReason" = $4
      WHERE "userId" = $1
      `,
          [userId, isBanned, banDate, banReason],
        );
      });
      if (isBanned) {
        // Successful User Ban Message
        console.log(
          `User Ban Successful 🚫✅\n\nThe user with ID ${userId} has been successfully banned. 
        They will no longer be able to access the platform or perform any actions. 
        This action was taken due to "${banReason}". Thank you for maintaining a safe environment 
        for our community.`,
        );
      } else {
        // Successful User unBan Message
        console.log(`User Unban Successful 🔓✅\n\nThe user with ID ${userId} 
        has been successfully unbanned. They can now access the platform and perform 
        actions as usual. We appreciate your attention to ensuring a fair and 
        inclusive community environment.`);
      }
      return true;
    } catch (error) {
      // Error in User Ban Message
      console.error(
        `User Ban Error ❌❗\n\nWe encountered an issue while attempting to ban the user 
        with ID ${userId}. Unfortunately, we couldn't complete the ban operation at this time.
         Please try again later or contact our support team for assistance.
          We apologize for any inconvenience this may have caused. ${error.message}`,
      );
      throw new InternalServerErrorException(error.message);
    }
  }
}

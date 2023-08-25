import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { TablesUsersEntity } from '../entities/tables-users.entity';
import { BanInfoDto } from '../dto/banInfo.dto';
import { TablesUsersWithIdEntity } from '../entities/tables-user-with-id.entity';
import { loginOrEmailAlreadyExists } from '../../../common/filters/custom-errors-messages';
import { KeyResolver } from '../../../common/helpers/key-resolver';
import { ParseQueriesDto } from '../../../common/query/dto/parse-queries.dto';
import { UserRolesEnums } from '../../../ability/enums/user-roles.enums';

@Injectable()
export class UsersRawSqlRepository {
  constructor(
    @InjectDataSource() private readonly db: DataSource,
    protected keyResolver: KeyResolver,
  ) {}

  async saFindUsers(
    queryData: ParseQueriesDto,
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

  async findUsers(
    queryData: ParseQueriesDto,
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
      return { userId: insertNewUser[0].userId, ...tablesUsersEntity };
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

  async findUserByConfirmationCode(confirmationCode: string): Promise<boolean> {
    try {
      const currentTime = new Date().toISOString();

      const query = `
        SELECT 
        "userId" AS "id", "login", "email", "passwordHash", "createdAt", 
        "orgId", "roles", "isBanned", "banDate", "banReason", "confirmationCode", 
        "expirationDate", "isConfirmed", "isConfirmedDate", "ip", "userAgent"
        FROM public."Users"
        WHERE "confirmationCode" = $1  
        AND "isConfirmed" = false 
        AND "expirationDate" > $2
        `;

      const user = await this.db.query(query, [confirmationCode, currentTime]);

      return !!user[0];
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async isConfirmedUserByCode(confirmationCode: string): Promise<boolean> {
    const isConfirmed = true;
    const isConfirmedDate = new Date().toISOString();
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

  async updateCodeAndExpirationByEmail(
    email: string,
    confirmationCode: string,
    expirationDate: string,
  ): Promise<TablesUsersWithIdEntity> {
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
  ): Promise<boolean> {
    try {
      const updateUserPassword = await this.db.query(
        `
      UPDATE public."Users"
      SET  "passwordHash" = $2
      WHERE "confirmationCode" = $1
      `,
        [recoveryCode, newPasswordHash],
      );
      return updateUserPassword[1] === 1;
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async loginOrEmailAlreadyExist(
    key: string,
  ): Promise<TablesUsersWithIdEntity[]> {
    try {
      return await this.db.query(
        `
        SELECT "userId" AS "id", "login", "email", "passwordHash", "createdAt", "orgId", "roles", "banDate", "banReason", "confirmationCode", "expirationDate", "isConfirmed", "isConfirmedDate", "ip", "userAgent", "isBanned"
        FROM public."Users"
        WHERE "login" = $1 OR "email" = $2
      `,
        [key.toLocaleLowerCase(), key.toLocaleLowerCase()],
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async totalCountUsersForSa(queryData: ParseQueriesDto): Promise<number> {
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

  async totalCountUsers(queryData: ParseQueriesDto): Promise<number> {
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
    roles: UserRolesEnums[],
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
          `User Ban 🚫. The user with ID ${userId} has been successfully banned.
          This action was taken due to "${banReason}".
          Thank you for maintaining a safe environment for our community.`,
        );
      } else {
        // Successful User unBan Message
        console.log(`User Unban 🔓. The user with ID ${userId} has been successfully unbanned. 
        They can now access the platform and perform actions as usual. 
        We appreciate your attention to ensuring a fair and inclusive community environment.`);
      }
      return true;
    } catch (error) {
      // Error in User Ban Message
      console.error(
        `User Ban Error ❌❗
        We encountered an issue while attempting to ban the user with ID ${userId}. 
        Unfortunately, we couldn't complete the ban operation at this time. 
        Please try again later or contact our support team for assistance. 
        We apologize for any inconvenience this may have caused. ${error.message}`,
      );
      throw new InternalServerErrorException(error.message);
    }
  }

  async removeUsersData(): Promise<void> {
    try {
      await this.db.transaction(async (client) => {
        const isConfirmed = false;
        const currentTime = new Date().toISOString();

        const allUsersWithExpiredDate: TablesUsersWithIdEntity[] =
          await client.query(
            `
                SELECT "userId" AS "id"
                FROM public."Users"
                WHERE "isConfirmed" = $1 AND "expirationDate" < $2
                `,
            [isConfirmed, currentTime],
          );

        await Promise.all(
          allUsersWithExpiredDate.map((user) =>
            this.deleteUserData(user.userId, client),
          ),
        );
      });
    } catch (error) {
      {
        console.error(`Error while removing data for users: ${error.message}`);
        throw new InternalServerErrorException(
          `Error while removing data for users`,
        );
      }
    }
  }

  async removeUserDataByUserId(userId: string): Promise<void> {
    try {
      await this.db.transaction(async (client) => {
        await this.deleteUserData(userId, client);
      });
    } catch (error) {
      {
        console.error(`Error while removing data for users: ${error.message}`);
        throw new InternalServerErrorException(
          `Error while removing data for users`,
        );
      }
    }
  }

  private async deleteUserData(
    userId: string,
    client: EntityManager,
  ): Promise<void> {
    try {
      // Concurrently delete security devices, banned users, and sent emails
      await Promise.all([
        client.query(
          `DELETE FROM public."SecurityDevices" WHERE "userId" = $1`,
          [userId],
        ),
        client.query(
          `DELETE FROM public."BannedUsersForBlogs" WHERE "userId" = $1`,
          [userId],
        ),
        client.query(
          `
          DELETE FROM public."SentCodeLog"
          WHERE "email" IN (
            SELECT "email" FROM public."Users" WHERE "userId" = $1
          )
          `,
          [userId],
        ),
        client.query(
          `DELETE FROM public."LikeStatusComments" WHERE "userId" = $1 OR "commentOwnerId" = $1`,
          [userId],
        ),
        client.query(
          `DELETE FROM public."LikeStatusPosts" WHERE "userId" = $1 OR "postOwnerId" = $1`,
          [userId],
        ),
      ]);

      await client.query(
        `DELETE FROM public."Comments" WHERE "commentatorInfoUserId" = $1`,
        [userId],
      );
      await client.query(
        `DELETE FROM public."Posts" WHERE "postOwnerId" = $1`,
        [userId],
      );
      await client.query(
        `DELETE FROM public."BloggerBlogs" WHERE "blogOwnerId" = $1`,
        [userId],
      );
      await client.query(`DELETE FROM public."Users" WHERE "userId" = $1`, [
        userId,
      ]);
    } catch (error) {
      console.error(
        `Error while removing data for user ${userId}: ${error.message}`,
      );
      throw new InternalServerErrorException(
        `Error while removing data for user ${userId}`,
      );
    }
  }

  private async getSortBy(sortBy: string): Promise<string> {
    return await this.keyResolver.resolveKey(
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
}

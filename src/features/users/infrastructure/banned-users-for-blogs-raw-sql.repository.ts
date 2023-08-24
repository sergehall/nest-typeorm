import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';
import { TableBannedUsersForBlogsEntity } from '../../blogger-blogs/entities/table-banned-users-for-blogs.entity';
import { KeyResolver } from '../../../common/helpers/key-resolver';
import { ParseQueriesDto } from '../../../common/query/dto/parse-queries.dto';
import { ReturnBannedUsersForBlogEntity } from '../../blogger-blogs/entities/return-banned-users-for-blog.entity';
import { BannedUsersCountBannedUsersDto } from '../../blogger-blogs/dto/banned-users-count-banned-users.dto';
import { BannedUsersCountBannedUsersEntity } from '../../posts/entities/banned-users-count-banned-users.entity';

export class BannedUsersForBlogsRawSqlRepository {
  constructor(
    @InjectDataSource() private readonly db: DataSource,
    protected keyResolver: KeyResolver,
  ) {}
  async addBannedOrDeleteUnBannedUser(
    bannedUserForBlogEntity: TableBannedUsersForBlogsEntity,
  ): Promise<boolean> {
    const { id, login, userId, blogId, isBanned, banDate, banReason } =
      bannedUserForBlogEntity;

    if (isBanned) {
      const insertOrUpdateQuery = `
      INSERT INTO public."BannedUsersForBlogs"
      ("id", "login", "isBanned", "banDate", "banReason", "blogId", "userId")
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT ("blogId", "userId", "isBanned")
      DO UPDATE SET "banDate" = $4, "banReason" = $5
      RETURNING "id";
    `;

      try {
        const insertOrUpdateResult = await this.db.query(insertOrUpdateQuery, [
          id,
          login,
          isBanned,
          banDate,
          banReason,
          blogId,
          userId,
        ]);

        return insertOrUpdateResult[0].length > 0;
      } catch (error) {
        console.log(error.message);
        throw new InternalServerErrorException(error.message);
      }
    } else {
      const deleteQuery = `
      DELETE FROM public."BannedUsersForBlogs"
      WHERE "blogId" = $1 AND "userId" = $2
      RETURNING "id";
    `;

      try {
        const result = await this.db.query(deleteQuery, [blogId, userId]);

        return result[0].length > 0;
      } catch (error) {
        console.log(error.message);
        throw new InternalServerErrorException(error.message);
      }
    }
  }

  async userIsBanned(userId: string, blogId: string): Promise<boolean> {
    try {
      const bannedUser: TableBannedUsersForBlogsEntity[] = await this.db.query(
        `
      SELECT "id", "login", "isBanned", "banDate", "banReason", "blogId", "userId"
      FROM public."BannedUsersForBlogs"
      WHERE "userId" = $1 AND "blogId" = $2
      `,
        [userId, blogId],
      );
      // Check if user found is not equal to zero
      return bannedUser.length !== 0;
    } catch (error) {
      console.log(error.message);
      // if not blogId not UUID will be error, and return false
      return false;
    }
  }

  async findBannedUsers(
    blogId: string,
    queryData: ParseQueriesDto,
  ): Promise<BannedUsersCountBannedUsersDto> {
    try {
      const searchLoginTerm = queryData.searchLoginTerm;
      const sortBy = await this.getSortBy(queryData.queryPagination.sortBy);
      const direction = queryData.queryPagination.sortDirection;
      const limit = queryData.queryPagination.pageSize;
      const offset = (queryData.queryPagination.pageNumber - 1) * limit;

      const query = `
        WITH banned_users_cte AS (
          SELECT "id", "blogId", "userId", "login", "isBanned", "banDate", "banReason"
          FROM public."BannedUsersForBlogs"
          WHERE "blogId" = $1 AND "login" ILIKE $2
          ORDER BY "${sortBy}" ${direction}
          LIMIT $3 OFFSET $4
        ),
        banned_users_count AS (
          SELECT count(*)::INTEGER AS count
          FROM public."BannedUsersForBlogs"
          WHERE "blogId" = $1 AND "login" ILIKE $2
        )
        SELECT *, (SELECT count FROM banned_users_count) AS "countBannedUsers"
        FROM banned_users_cte;
      `;

      const parameters = [blogId, searchLoginTerm, limit, offset];

      const result: BannedUsersCountBannedUsersEntity[] = await this.db.query(
        query,
        parameters,
      );

      if (result.length === 0) {
        return {
          bannedUsers: [],
          countBannedUsers: 0,
        };
      }

      return {
        bannedUsers: await this.transformedBannedUsers(result),
        countBannedUsers: result[0].countBannedUsers,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  private async transformedBannedUsers(
    bannedUsers: BannedUsersCountBannedUsersEntity[],
  ): Promise<ReturnBannedUsersForBlogEntity[]> {
    return bannedUsers.reduce<ReturnBannedUsersForBlogEntity[]>((acc, user) => {
      acc.push({
        id: user.userId,
        login: user.login,
        banInfo: {
          isBanned: user.isBanned,
          banDate: user.banDate,
          banReason: user.banReason,
        },
      });
      return acc;
    }, []);
  }

  private async getSortBy(sortBy: string): Promise<string> {
    return await this.keyResolver.resolveKey(
      sortBy,
      ['login', 'banReason'],
      'banDate',
    );
  }
}

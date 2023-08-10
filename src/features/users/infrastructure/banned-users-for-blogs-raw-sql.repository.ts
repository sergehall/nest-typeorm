import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { BannedUsersForBlogsEntity } from '../../blogger-blogs/entities/banned-users-for-blogs.entity';
import { ParseQueriesType } from '../../common/query/types/parse-query.types';
import { KeyArrayProcessor } from '../../common/query/get-key-from-array-or-default';

export class BannedUsersForBlogsRawSqlRepository {
  constructor(
    @InjectDataSource() private readonly db: DataSource,
    protected keyArrayProcessor: KeyArrayProcessor,
  ) {}
  async addBannedOrDeleteUnBannedUser(
    bannedUserForBlogEntity: BannedUsersForBlogsEntity,
  ): Promise<boolean> {
    const isBanned = bannedUserForBlogEntity.isBanned;

    if (isBanned) {
      const insertOrUpdateQuery = `
      INSERT INTO public."BannedUsersForBlogs"
      ("id", "login", "isBanned", "banDate", "banReason", "blogId", "userId")
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING "id";
    `;

      try {
        const insertOrUpdateResult = await this.db.query(insertOrUpdateQuery, [
          bannedUserForBlogEntity.id,
          bannedUserForBlogEntity.login,
          bannedUserForBlogEntity.isBanned,
          bannedUserForBlogEntity.banDate,
          bannedUserForBlogEntity.banReason,
          bannedUserForBlogEntity.blogId,
          bannedUserForBlogEntity.userId,
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
        const deleteResult = await this.db.query(deleteQuery, [
          bannedUserForBlogEntity.blogId,
          bannedUserForBlogEntity.userId,
        ]);

        return deleteResult[0].length > 0;
      } catch (error) {
        console.log(error.message);
        throw new InternalServerErrorException(error.message);
      }
    }
  }

  async userIsBanned(userId: string, blogId: string): Promise<boolean> {
    try {
      const bannedUser: BannedUsersForBlogsEntity[] = await this.db.query(
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
    queryData: ParseQueriesType,
  ): Promise<BannedUsersForBlogsEntity[]> {
    try {
      const searchLoginTerm = queryData.searchLoginTerm;
      const sortBy = await this.getSortBy(queryData.queryPagination.sortBy);
      const direction = queryData.queryPagination.sortDirection;
      const limit = queryData.queryPagination.pageSize;
      const offset = (queryData.queryPagination.pageNumber - 1) * limit;

      return await this.db.query(
        `
        SELECT "id", "blogId", "userId", "login", "isBanned", "banDate", "banReason"
        FROM public."BannedUsersForBlogs"
        WHERE "blogId" = $1 AND "login" ILIKE $2
        ORDER BY "${sortBy}" ${direction}
        LIMIT $3 OFFSET $4
        `,
        [blogId, searchLoginTerm, limit, offset],
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async countBannedUsersForBlog(blogId: string): Promise<number> {
    try {
      const countBannedUsers = await this.db.query(
        `
        SELECT count(*)
        FROM public."BannedUsersForBlogs"
        WHERE "blogId" = $1
      `,
        [blogId],
      );
      return Number(countBannedUsers[0].count);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async removeBannedUserByUserId(userId: string): Promise<boolean> {
    try {
      return await this.db.query(
        `
        DELETE FROM public."BannedUsersForBlogs"
        WHERE "userId" = $1
          `,
        [userId],
      );
    } catch (error) {
      console.log(error.message);
      throw new NotFoundException(error.message);
    }
  }

  async removeBannedUserByBlogId(blogId: string): Promise<boolean> {
    try {
      return await this.db.query(
        `
        DELETE FROM public."BannedUsersForBlogs"
        WHERE "blogId" = $1
          `,
        [blogId],
      );
    } catch (error) {
      console.log(error.message);
      throw new NotFoundException(error.message);
    }
  }
  private async getSortBy(sortBy: string): Promise<string> {
    return await this.keyArrayProcessor.getKeyFromArrayOrDefault(
      sortBy,
      ['login', 'banReason'],
      'banDate',
    );
  }
}

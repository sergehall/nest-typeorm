import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { BannedUsersForBlogsEntity } from '../../blogger-blogs/entities/banned-users-for-blogs.entity';
import { ParseQueryType } from '../../common/query/parse-query';

export class BannedUsersForBlogsRawSqlRepository {
  constructor(@InjectDataSource() private readonly db: DataSource) {}
  async addBannedUserToBanList(
    bannedUserForBlogEntity: BannedUsersForBlogsEntity,
  ): Promise<boolean> {
    try {
      const updateLikeStatusPost = await this.db.query(
        `
      INSERT INTO public."BannedUsersForBlogs"
      ("id", "blogId", "userId", "login", "isBanned", "banDate", "banReason")
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT ( "blogId", "userId" ) 
      DO UPDATE SET "isBanned" = $5, "banDate" = $6, "banReason" = $7
      RETURNING "id"
      `,
        [
          bannedUserForBlogEntity.id,
          bannedUserForBlogEntity.blogId,
          bannedUserForBlogEntity.userId,
          bannedUserForBlogEntity.login,
          bannedUserForBlogEntity.isBanned,
          bannedUserForBlogEntity.banDate,
          bannedUserForBlogEntity.banReason,
        ],
      );
      return updateLikeStatusPost[0] != null;
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async existenceBannedUser(userId: string, blogId: string): Promise<boolean> {
    try {
      const isBanned = true;
      const bannedUser: BannedUsersForBlogsEntity[] = await this.db.query(
        `
      SELECT "id"
      FROM public."BannedUsersForBlogs"
      WHERE "userId" = $1 AND "blogId" = $2 AND "isBanned" = $3
      `,
        [userId, blogId, isBanned],
      );
      // Return true if bannedUser found, if not found return false.
      return bannedUser.length !== 0;
    } catch (error) {
      console.log(error.message);
      // if not blogId not UUID will be error, and return false
      return false;
    }
  }

  async findBannedUsers(
    blogId: string,
    queryData: ParseQueryType,
  ): Promise<BannedUsersForBlogsEntity[]> {
    try {
      const isBanned = true;
      const direction = this.getSortingDirection(queryData);
      const searchLoginTerm = this.getSearchLoginTerm(
        queryData.searchLoginTerm,
      );
      const sortBy = this.mapSortByField(queryData.queryPagination.sortBy);
      const limit = queryData.queryPagination.pageSize;
      const offset = queryData.queryPagination.pageNumber - 1;

      return await this.db.query(
        `
        SELECT "id", "blogId", "userId", "login", "isBanned", "banDate", "banReason"
        FROM public."BannedUsersForBlogs"
        WHERE "isBanned" = $1 AND "blogId" = $2
        AND "login" ILIKE $3
        ORDER BY "${sortBy}" ${direction}
        LIMIT $4 OFFSET $5
        `,
        [isBanned, blogId, searchLoginTerm, limit, offset],
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async countBannedUsersForBlog(blogId: string): Promise<number> {
    try {
      const isBanned = true;
      const countBannedUsers = await this.db.query(
        `
        SELECT count(*)
        FROM public."BannedUsersForBlogs"
        WHERE "isBanned" = $1  AND "blogId" = $2
      `,
        [isBanned, blogId],
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

  private getSortingDirection(queryData: ParseQueryType): 'ASC' | 'DESC' {
    return [-1, 'ascending', 'ASCENDING', 'asc', 'ASC'].includes(
      queryData.queryPagination.sortDirection,
    )
      ? 'ASC'
      : 'DESC';
  }

  private getSearchLoginTerm(searchLoginTerm: string): string {
    return searchLoginTerm.length !== 0 ? `%${searchLoginTerm}%` : '%%';
  }

  private mapSortByField(sortBy: string): string {
    return sortBy === 'createdAt' ? 'banDate' : sortBy;
  }
}

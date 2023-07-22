import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';
import { BannedUsersForBlogsEntity } from '../entities/banned-users-for-blogs.entity';
import { ParseQueryType } from '../../common/parse-query/parse-query';

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
      console.log(
        queryData.queryPagination.sortBy,
        '-------sortBy------',
        sortBy,
      );
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
        [
          isBanned,
          blogId,
          searchLoginTerm,
          queryData.queryPagination.pageSize,
          offset,
        ],
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message);
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
}

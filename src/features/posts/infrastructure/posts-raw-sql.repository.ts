import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';
import { PostsRawSqlEntity } from '../entities/posts-raw-sql.entity';
import { ParseQueryType } from '../../common/parse-query/parse-query';
import { BlogIdParams } from '../../common/params/blogId.params';

export class PostsRawSqlRepository {
  constructor(@InjectDataSource() private readonly db: DataSource) {}
  async openFindPosts(
    queryData: ParseQueryType,
    postOwnerIsBanned: boolean,
    banInfoBanStatus: boolean,
  ): Promise<PostsRawSqlEntity[]> {
    try {
      const direction = [-1, 'ascending', 'ASCENDING', 'asc', 'ASC'].includes(
        queryData.queryPagination.sortDirection,
      )
        ? 'ASC'
        : 'DESC';
      const orderByDirection = `"${queryData.queryPagination.sortBy}" ${direction}`;
      return await this.db.query(
        `
        SELECT "id", "title", "shortDescription", "content", "blogId", "blogName", 
          "createdAt", "postOwnerId", "postOwnerLogin", "postOwnerIsBanned", 
          "banInfoBanStatus", "banInfoBanDate", "banInfoBanReason"
        FROM public."Posts"
        WHERE "postOwnerIsBanned" = $1 AND "banInfoBanStatus" = $2
        ORDER BY ${orderByDirection}
        LIMIT $3 OFFSET $4
        `,
        [
          postOwnerIsBanned,
          banInfoBanStatus,
          queryData.queryPagination.pageSize,
          queryData.queryPagination.pageNumber - 1,
        ],
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
  async findPostsByBlogId(
    params: BlogIdParams,
    queryData: ParseQueryType,
    postOwnerIsBanned: boolean,
    banInfoBanStatus: boolean,
  ): Promise<PostsRawSqlEntity[]> {
    try {
      const direction = [-1, 'ascending', 'ASCENDING', 'asc', 'ASC'].includes(
        queryData.queryPagination.sortDirection,
      )
        ? 'ASC'
        : 'DESC';
      const orderByDirection = `"${queryData.queryPagination.sortBy}" ${direction}`;
      return await this.db.query(
        `
        SELECT "id", "title", "shortDescription", "content", "blogId", "blogName", 
          "createdAt", "postOwnerId", "postOwnerLogin", "postOwnerIsBanned", 
          "banInfoBanStatus", "banInfoBanDate", "banInfoBanReason"
        FROM public."Posts"
        WHERE "blogId" = $5 AND "postOwnerIsBanned" = $1 AND "banInfoBanStatus" = $2
        ORDER BY ${orderByDirection}
        LIMIT $3 OFFSET $4
        `,
        [
          postOwnerIsBanned,
          banInfoBanStatus,
          queryData.queryPagination.pageSize,
          queryData.queryPagination.pageNumber - 1,
          params.blogId,
        ],
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async totalCountPosts(
    postOwnerIsBanned: boolean,
    banInfoBanStatus: boolean,
  ): Promise<number> {
    try {
      const countBlogs = await this.db.query(
        `
        SELECT count(*)
        FROM public."Posts"
        WHERE "postOwnerIsBanned" = $1 AND "banInfoBanStatus" = $2
      `,
        [postOwnerIsBanned, banInfoBanStatus],
      );
      return Number(countBlogs[0].count);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
  async totalCountPostsByBlogId(
    params: BlogIdParams,
    postOwnerIsBanned: boolean,
    banInfoBanStatus: boolean,
  ): Promise<number> {
    try {
      const countBlogs = await this.db.query(
        `
        SELECT count(*)
        FROM public."Posts"
        WHERE "blogId" = $3 AND "postOwnerIsBanned" = $1 AND "banInfoBanStatus" = $2
      `,
        [postOwnerIsBanned, banInfoBanStatus, params.blogId],
      );
      return Number(countBlogs[0].count);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findPostByPostId(postId: string): Promise<PostsRawSqlEntity | null> {
    try {
      const postOwnerIsBanned = false;
      const banInfoBanStatus = false;
      const post = await this.db.query(
        `
      SELECT "id", "title", "shortDescription", "content", "blogId", "blogName", "createdAt", "postOwnerId", "postOwnerLogin", "postOwnerIsBanned", "banInfoBanStatus", "banInfoBanDate", "banInfoBanReason"
      FROM public."Posts"
      WHERE "id" = $1 AND "postOwnerIsBanned" = $2 AND "banInfoBanStatus" = $3
      `,
        [postId, postOwnerIsBanned, banInfoBanStatus],
      );
      // Return the first blog if found, if not found actuate catch (error)
      return post[0];
    } catch (error) {
      console.log(error.message);
      // If an error occurs, return null instead of throwing an exception
      return null;
    }
  }
  async createPost(
    postsRawSqlEntity: PostsRawSqlEntity,
  ): Promise<PostsRawSqlEntity> {
    try {
      const insertNewPost = await this.db.query(
        `
        INSERT INTO public."Posts"
        ( "id", "title", "shortDescription", "content", "blogId", "blogName", 
          "createdAt", "postOwnerId", "postOwnerLogin", "postOwnerIsBanned", 
          "banInfoBanStatus", "banInfoBanDate", "banInfoBanReason")
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          returning 
          "id", "title", "shortDescription", "content", "blogId", "blogName", 
          "createdAt"
          `,
        [
          postsRawSqlEntity.id,
          postsRawSqlEntity.title,
          postsRawSqlEntity.shortDescription,
          postsRawSqlEntity.content,
          postsRawSqlEntity.blogId,
          postsRawSqlEntity.blogName,
          postsRawSqlEntity.createdAt,
          postsRawSqlEntity.postOwnerId,
          postsRawSqlEntity.postOwnerLogin,
          postsRawSqlEntity.postOwnerIsBanned,
          postsRawSqlEntity.banInfoBanStatus,
          postsRawSqlEntity.banInfoBanDate,
          postsRawSqlEntity.banInfoBanReason,
        ],
      );
      return insertNewPost[0];
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }
}

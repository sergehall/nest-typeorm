import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PostsRawSqlEntity } from '../entities/posts-raw-sql.entity';
import { ParseQueryType } from '../../common/parse-query/parse-query';
import { BlogIdParams } from '../../common/params/blogId.params';
import { UpdatePostDto } from '../dto/update-post.dto';
import { BannedUsersForBlogsEntity } from '../../blogger-blogs/entities/banned-users-for-blogs.entity';

export class PostsRawSqlRepository {
  constructor(@InjectDataSource() private readonly db: DataSource) {}

  async openFindPosts(queryData: ParseQueryType): Promise<PostsRawSqlEntity[]> {
    const postOwnerIsBanned = false;
    const banInfoBanStatus = false;
    try {
      const direction = [-1, 'ascending', 'ASCENDING', 'asc', 'ASC'].includes(
        queryData.queryPagination.sortDirection,
      )
        ? 'ASC'
        : 'DESC';
      const orderByDirection = `"${queryData.queryPagination.sortBy}" ${direction}`;
      return await this.db.query(
        `
        SELECT "id", "title", "shortDescription", "content", "blogId", "blogName", "createdAt",
         "postOwnerId", "dependencyIsBanned",
         "banInfoIsBanned", "banInfoBanDate", "banInfoBanReason"
        FROM public."Posts"
        WHERE "dependencyIsBanned" = $1 AND "banInfoIsBanned" = $2
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

  async findPostByPostId(postId: string): Promise<PostsRawSqlEntity | null> {
    try {
      const dependencyIsBanned = false;
      const banInfoIsBanned = false;
      const post = await this.db.query(
        `
      SELECT "id", "title", "shortDescription", "content", 
      "blogId", "blogName", "createdAt", 
      "postOwnerId", "dependencyIsBanned", 
      "banInfoIsBanned", "banInfoBanDate", "banInfoBanReason"
      FROM public."Posts"
      WHERE "id" = $1 AND "dependencyIsBanned" = $2 AND "banInfoIsBanned" = $3
      `,
        [postId, dependencyIsBanned, banInfoIsBanned],
      );
      // Return the first blog if found, if not found actuate catch (error)
      return post[0];
    } catch (error) {
      console.log(error.message);
      // If an error occurs, return null instead of throwing an exception
      return null;
    }
  }

  async findPostsByBlogId(
    params: BlogIdParams,
    queryData: ParseQueryType,
  ): Promise<PostsRawSqlEntity[] | null> {
    const postOwnerIsBanned = false;
    const banInfoBanStatus = false;
    try {
      const direction = [-1, 'ascending', 'ASCENDING', 'asc', 'ASC'].includes(
        queryData.queryPagination.sortDirection,
      )
        ? 'ASC'
        : 'DESC';
      const orderByDirection = `"${queryData.queryPagination.sortBy}" ${direction}`;
      // Return posts if found, if not found actuate catch (error)
      return await this.db.query(
        `
        SELECT "id", "title", "shortDescription", "content", "blogId", "blogName", "createdAt",
         "postOwnerId", "dependencyIsBanned",
         "banInfoIsBanned", "banInfoBanDate", "banInfoBanReason"
        FROM public."Posts"
        WHERE "blogId" = $5 AND "dependencyIsBanned" = $1 AND "banInfoIsBanned" = $2
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
            (
             "id", "title", "shortDescription", "content", "blogId", "blogName", "createdAt",
             "postOwnerId", "dependencyIsBanned",
             "banInfoIsBanned", "banInfoBanDate", "banInfoBanReason")
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
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
          postsRawSqlEntity.dependencyIsBanned,
          postsRawSqlEntity.banInfoIsBanned,
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

  async updatePostByPostId(
    postId: string,
    updatePostDto: UpdatePostDto,
  ): Promise<boolean> {
    try {
      const updatePost = await this.db.query(
        `
      UPDATE public."Posts"
      SET  "title" = $2, "shortDescription" = $3, "content" = $4
      WHERE "id" = $1`,
        [
          postId,
          updatePostDto.title,
          updatePostDto.shortDescription,
          updatePostDto.content,
        ],
      );
      return updatePost[1] === 1;
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async totalCountPosts(): Promise<number> {
    const postOwnerIsBanned = false;
    const banInfoBanStatus = false;
    try {
      const countBlogs = await this.db.query(
        `
        SELECT count(*)
        FROM public."Posts"
        WHERE "dependencyIsBanned" = $1 AND "banInfoIsBanned" = $2
      `,
        [postOwnerIsBanned, banInfoBanStatus],
      );
      return Number(countBlogs[0].count);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
  async totalCountPostsByBlogId(params: BlogIdParams): Promise<number> {
    const postOwnerIsBanned = false;
    const banInfoBanStatus = false;
    try {
      const countBlogs = await this.db.query(
        `
        SELECT count(*)
        FROM public."Posts"
        WHERE "blogId" = $3 AND "dependencyIsBanned" = $1 AND "banInfoIsBanned" = $2
      `,
        [postOwnerIsBanned, banInfoBanStatus, params.blogId],
      );
      return Number(countBlogs[0].count);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async removePostByPostId(postId: string): Promise<boolean> {
    try {
      const isDeleted = await this.db.query(
        `
        DELETE FROM public."Posts"
        WHERE "id" = $1
        RETURNING "id"
          `,
        [postId],
      );
      return isDeleted[1] === 1;
    } catch (error) {
      console.log(error.message);
      throw new NotFoundException(error.message);
    }
  }

  async changeBanStatusPostByUserId(
    userId: string,
    isBanned: boolean,
  ): Promise<boolean> {
    try {
      const updatePosts = await this.db.query(
        `
      UPDATE public."Posts"
      SET "dependencyIsBanned" = $2
      WHERE "postOwnerId" = $1`,
        [userId, isBanned],
      );
      return !!updatePosts[0];
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async changeBanStatusPostByUserIdAndBlogId(
    bannedUserForBlogEntity: BannedUsersForBlogsEntity,
  ): Promise<boolean> {
    const { userId, blogId, isBanned } = bannedUserForBlogEntity;
    try {
      const updatePosts = await this.db.query(
        `
      UPDATE public."Posts"
      SET "dependencyIsBanned" = $2
      WHERE "postOwnerId" = $1`,
        [userId, blogId, isBanned],
      );
      return !!updatePosts[0];
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async changeBanStatusPostsByBlogId(
    blogId: string,
    isBanned: boolean,
  ): Promise<boolean> {
    try {
      return await this.db.query(
        `
      UPDATE public."Posts"
      SET "dependencyIsBanned" = $2
      WHERE "blogId" = $1
      `,
        [blogId, isBanned],
      );
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async removePostsByUserId(userId: string): Promise<boolean> {
    try {
      return await this.db.query(
        `
        DELETE FROM public."Posts"
        WHERE "postOwnerId" = $1
          `,
        [userId],
      );
    } catch (error) {
      console.log(error.message);
      throw new NotFoundException(error.message);
    }
  }

  async removePostsByBlogId(blogId: string): Promise<boolean> {
    try {
      return await this.db.query(
        `
        DELETE FROM public."Posts"
        WHERE "blogId" = $1
          `,
        [blogId],
      );
    } catch (error) {
      console.log(error.message);
      throw new NotFoundException(error.message);
    }
  }

  async changeIntoPostsBlogOwner(
    blogId: string,
    userId: string,
  ): Promise<boolean> {
    try {
      return await this.db.query(
        `
        UPDATE public."Posts"
        SET "postOwnerId" = $2
        WHERE "blogId" = $1
        `,
        [blogId, userId],
      );
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }
}

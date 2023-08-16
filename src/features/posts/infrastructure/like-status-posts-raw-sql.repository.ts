import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';
import { TablesLikeStatusPostsEntity } from '../entities/tables-like-status-posts.entity';
import { TablesLikeStatusCommentsEntity } from '../../comments/entities/tables-like-status-comments.entity';
import { BannedUsersForBlogsEntity } from '../../blogger-blogs/entities/banned-users-for-blogs.entity';
import { NewestLikes } from '../entities/return-posts-entity.entity';

export class LikeStatusPostsRawSqlRepository {
  constructor(@InjectDataSource() private readonly db: DataSource) {}
  async updateLikeStatusPosts(
    likeStatusCommEntity: TablesLikeStatusPostsEntity,
  ): Promise<boolean> {
    try {
      const updateLikeStatusPost = await this.db.query(
        `
      INSERT INTO public."LikeStatusPosts"
      ("postId", "userId", "blogId", "isBanned", "login", "likeStatus", "addedAt", "postOwnerId")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT ( "postId", "userId" ) 
      DO UPDATE SET "postId" = $1, "userId" = $2, "blogId" = $3,
       "isBanned" = $4, "login" = $5, "likeStatus" = $6, "addedAt" = $7, "postOwnerId" = $8
      RETURNING "userId"
      `,
        [
          likeStatusCommEntity.postId,
          likeStatusCommEntity.userId,
          likeStatusCommEntity.blogId,
          likeStatusCommEntity.isBanned,
          likeStatusCommEntity.login,
          likeStatusCommEntity.likeStatus,
          likeStatusCommEntity.addedAt,
          likeStatusCommEntity.postOwnerId,
        ],
      );
      return updateLikeStatusPost[0] != null;
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async changeBanStatusLikesPostsByUserIdBlogId(
    bannedUserForBlogEntity: BannedUsersForBlogsEntity,
  ): Promise<boolean> {
    const { userId, blogId, isBanned } = bannedUserForBlogEntity;
    try {
      return await this.db.query(
        `
        UPDATE public."LikeStatusPosts"
        SET "isBanned" = $3
        WHERE "userId" = $1 AND "blogId" = $2
        `,
        [userId, blogId, isBanned],
      );
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }
  async changeBanStatusLikesPostsByBlogId(
    blogId: string,
    isBanned: boolean,
  ): Promise<boolean> {
    try {
      return await this.db.query(
        `
        UPDATE public."LikeStatusPosts"
        SET "isBanned" = $2
        WHERE "blogId" = $1
        `,
        [blogId, isBanned],
      );
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async countLikesDislikes(
    postId: string,
    isBanned: boolean,
    likeStatus: string,
  ): Promise<number> {
    try {
      const countBlogs = await this.db.query(
        `
        SELECT count(*)
        FROM public."LikeStatusPosts"
        WHERE "postId" = $1 AND "isBanned" = $2 AND "likeStatus" = $3
      `,
        [postId, isBanned, likeStatus],
      );
      return Number(countBlogs[0].count);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
  async findOne(
    postId: string,
    userId: string,
    isBanned: boolean,
  ): Promise<TablesLikeStatusCommentsEntity[]> {
    try {
      return await this.db.query(
        `
        SELECT "postId", "userId", "blogId", "isBanned", "login", "likeStatus", "addedAt", "postOwnerId"
        FROM public."LikeStatusPosts"
        WHERE "postId" = $1 AND "userId" = $2 AND "isBanned" = $3
          `,
        [postId, userId, isBanned],
      );
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }
  async findNewestLikes(
    postId: string,
    likeStatus: string,
    isBanned: boolean,
    limitLikes: number,
  ): Promise<NewestLikes[]> {
    try {
      return await this.db.query(
        `
        SELECT "userId", "login", "addedAt"
        FROM public."LikeStatusPosts"
        WHERE "postId" = $1 AND "likeStatus" = $2 AND "isBanned" = $3
        ORDER BY "addedAt" DESC
        LIMIT $4 OFFSET 0
          `,
        [postId, likeStatus, isBanned, limitLikes],
      );
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async changeBanStatusPostsLikesByUserId(
    userId: string,
    isBanned: boolean,
  ): Promise<boolean> {
    try {
      return await this.db.query(
        `
        UPDATE public."LikeStatusPosts"
        SET "isBanned" = $2
        WHERE "userId" = $1 OR "postOwnerId" = $1
        `,
        [userId, isBanned],
      );
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async removeLikesPostsByBlogId(blogId: string): Promise<boolean> {
    try {
      return await this.db.query(
        `
        DELETE FROM public."LikeStatusPosts"
        WHERE "blogId" = $1
        `,
        [blogId],
      );
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async deleteLikesPostByPostId(postId: string): Promise<boolean> {
    try {
      return await this.db.query(
        `
        DELETE FROM public."LikeStatusPosts"
        WHERE "postId" = $1
        `,
        [postId],
      );
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }
}

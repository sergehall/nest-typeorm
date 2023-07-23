import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';
import { LikeStatusPostEntity } from '../entities/like-status-post.entity';
import { LikeStatusCommentEntity } from '../../comments/entities/like-status-comment.entity';
import { NewestLikes } from '../entities/posts-without-ownerInfo.entity';
import { BannedUsersForBlogsEntity } from '../../blogger-blogs/entities/banned-users-for-blogs.entity';

export class LikeStatusPostsRawSqlRepository {
  constructor(@InjectDataSource() private readonly db: DataSource) {}
  async updateLikeStatusPosts(
    likeStatusCommEntity: LikeStatusPostEntity,
  ): Promise<boolean> {
    try {
      const updateLikeStatusPost = await this.db.query(
        `
      INSERT INTO public."LikeStatusPosts"
      ("postId", "userId", "blogId", "isBanned", "login", "likeStatus", "addedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT ( "postId", "userId" ) 
      DO UPDATE SET "postId" = $1, "userId" = $2, "blogId" = $3,
       "isBanned" = $4, "login" = $5, "likeStatus" = $6, "addedAt" = $7
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
    try {
      return await this.db.query(
        `
        UPDATE public."LikeStatusPosts"
        SET "isBanned" = $3
        WHERE "userId" = $1 AND "blogId" = $2
        `,
        [
          bannedUserForBlogEntity.userId,
          bannedUserForBlogEntity.blogId,
          bannedUserForBlogEntity.isBanned,
        ],
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
  ): Promise<LikeStatusCommentEntity[]> {
    try {
      return await this.db.query(
        `
        SELECT "postId", "userId", "blogId", "isBanned", "login", "likeStatus", "addedAt"
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
        WHERE "userId" = $1
        `,
        [userId, isBanned],
      );
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }
}

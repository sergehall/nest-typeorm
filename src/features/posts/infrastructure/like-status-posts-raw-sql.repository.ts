import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { LikeStatusDto } from '../../comments/dto/like-status.dto';
import { CurrentUserDto } from '../../users/dto/currentUser.dto';
import { TablesPostsEntity } from '../entities/tables-posts-entity';
import { InternalServerErrorException } from '@nestjs/common';
import { TableBannedUsersForBlogsEntity } from '../../blogger-blogs/entities/table-banned-users-for-blogs.entity';

export class LikeStatusPostsRawSqlRepository {
  constructor(@InjectDataSource() private readonly db: DataSource) {}

  async updateLikeStatusPosts(
    post: TablesPostsEntity,
    likeStatusDto: LikeStatusDto,
    currentUserDto: CurrentUserDto,
  ): Promise<boolean> {
    const newTablesLikeStatusPostsEntity =
      await this.getTablesLikeStatusPostsEntity(
        post,
        likeStatusDto,
        currentUserDto,
      );

    const query = `
    INSERT INTO public."LikeStatusPosts"
    ("postId", "userId", "blogId", "isBanned", "login", "likeStatus", "addedAt", "postOwnerId")
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT ("postId", "userId")
    DO UPDATE SET "postId" = $1, "userId" = $2, "blogId" = $3,
                 "isBanned" = $4, "login" = $5, "likeStatus" = $6,
                  "addedAt" = $7, "postOwnerId" = $8
    RETURNING "userId";
  `;

    const parameters = [
      newTablesLikeStatusPostsEntity.postId,
      newTablesLikeStatusPostsEntity.userId,
      newTablesLikeStatusPostsEntity.blogId,
      newTablesLikeStatusPostsEntity.isBanned,
      newTablesLikeStatusPostsEntity.login,
      newTablesLikeStatusPostsEntity.likeStatus,
      newTablesLikeStatusPostsEntity.addedAt,
      newTablesLikeStatusPostsEntity.postOwnerId,
    ];

    try {
      const updateLikeStatusPost = await this.db.query(query, parameters);

      return updateLikeStatusPost[0] !== null;
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async changeBanStatusLikesPostsByUserIdBlogId(
    bannedUserForBlogEntity: TableBannedUsersForBlogsEntity,
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

  private async getTablesLikeStatusPostsEntity(
    post: TablesPostsEntity,
    likeStatusDto: LikeStatusDto,
    currentUserDto: CurrentUserDto,
  ) {
    return {
      blogId: post.blogId,
      postOwnerId: post.postOwnerId,
      postId: post.id,
      userId: currentUserDto.userId,
      login: currentUserDto.login,
      isBanned: currentUserDto.isBanned,
      likeStatus: likeStatusDto.likeStatus,
      addedAt: new Date().toISOString(),
    };
  }
}

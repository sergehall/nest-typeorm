import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';
import { BannedUsersForBlogsEntity } from '../entities/banned-users-for-blogs.entity';

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
}

import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';
import { PostsRawSqlEntity } from '../entities/posts-raw-sql.entity';

export class PostsRawSqlRepository {
  constructor(@InjectDataSource() private readonly db: DataSource) {}

  async findPostByPostId(postId: string): Promise<PostsRawSqlEntity | null> {
    try {
      const post = await this.db.query(
        `
      SELECT "id", "title", "shortDescription", "content", "blogId", "blogName", "createdAt", "postOwnerId", "postOwnerLogin", "postOwnerIsBanned", "banInfoBanStatus", "banInfoBanDate", "banInfoBanReason"
      FROM public."Posts"
      WHERE "id" = $1`,
        [postId],
      );
      return post[0] ? post[0] : null;
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
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

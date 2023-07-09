import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';
import { TablesCommentsRawSqlEntity } from '../entities/tables-comments-raw-sql.entity';

export class CommentsRawSqlRepository {
  constructor(@InjectDataSource() private readonly db: DataSource) {}
  async createComment(
    tablesCommentsRawSqlEntity: TablesCommentsRawSqlEntity,
  ): Promise<TablesCommentsRawSqlEntity> {
    try {
      const insertNewComment = await this.db.query(
        `
        INSERT INTO public.comments(
        "id", "content", "createdAt", 
        "postInfoId", "postInfoTitle", "postInfoBlogId", "postInfoBlogName", 
        "postInfoBlogOwnerId", 
        "commentatorInfoUserId", "commentatorInfoUserLogin", 
        "commentatorInfoIsBanned", 
        "banInfoIsBanned", "banInfoBanDate", "banInfoBanReason")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        returning 
        "id", "content", "createdAt"
        "commentatorInfoUserId", "commentatorInfoUserLogin"
          `,
        [
          tablesCommentsRawSqlEntity.id,
          tablesCommentsRawSqlEntity.content,
          tablesCommentsRawSqlEntity.createdAt,
          tablesCommentsRawSqlEntity.postInfoId,
          tablesCommentsRawSqlEntity.postInfoTitle,
          tablesCommentsRawSqlEntity.postInfoBlogId,
          tablesCommentsRawSqlEntity.postInfoBlogName,
          tablesCommentsRawSqlEntity.postInfoBlogOwnerId,
          tablesCommentsRawSqlEntity.commentatorInfoUserId,
          tablesCommentsRawSqlEntity.commentatorInfoUserLogin,
          tablesCommentsRawSqlEntity.commentatorInfoIsBanned,
          tablesCommentsRawSqlEntity.banInfoIsBanned,
          tablesCommentsRawSqlEntity.banInfoBanDate,
          tablesCommentsRawSqlEntity.banInfoBanReason,
        ],
      );
      return insertNewComment[0];
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }
}

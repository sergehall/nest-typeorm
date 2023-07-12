import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';
import { TablesCommentsRawSqlEntity } from '../entities/tables-comments-raw-sql.entity';
import { PaginationDBType } from '../../common/pagination/types/pagination.types';

export class CommentsRawSqlRepository {
  constructor(@InjectDataSource() private readonly db: DataSource) {}
  async createComment(
    tablesCommentsRawSqlEntity: TablesCommentsRawSqlEntity,
  ): Promise<TablesCommentsRawSqlEntity> {
    try {
      const insertNewComment = await this.db.query(
        `
        INSERT INTO public."Comments"(
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
  async findCommentsByBlogOwnerId(
    pagination: PaginationDBType,
    postInfoBlogOwnerId: string,
    commentatorInfoIsBanned: boolean,
    banInfoIsBanned: boolean,
  ): Promise<TablesCommentsRawSqlEntity[]> {
    try {
      const direction = [-1, 'ascending', 'ASCENDING', 'asc', 'ASC'].includes(
        pagination.direction,
      )
        ? 'ASC'
        : 'DESC';

      return await this.db.query(
        `
        SELECT "id", "content", "createdAt", "postInfoId", "postInfoTitle", "postInfoBlogId", "postInfoBlogName", "postInfoBlogOwnerId", "commentatorInfoUserId", "commentatorInfoUserLogin", "commentatorInfoIsBanned", "likesInfoLikesCount", "likesInfoDislikesCount", "likesInfoMyStatus", "banInfoIsBanned", "banInfoBanDate", "banInfoBanReason"
        FROM public."Comments"
        WHERE "postInfoBlogOwnerId" = $1 AND "commentatorInfoIsBanned" = $2 
        AND "banInfoIsBanned" = $3
        ORDER BY "${pagination.field}" ${direction}
        LIMIT $4 OFFSET $5
          `,
        [
          postInfoBlogOwnerId,
          commentatorInfoIsBanned,
          banInfoIsBanned,
          pagination.pageSize,
          pagination.startIndex,
        ],
      );
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }
  async findCommentById(
    commentId: string,
  ): Promise<TablesCommentsRawSqlEntity[]> {
    try {
      return await this.db.query(
        `
        SELECT "id", "content", "createdAt", "postInfoId", "postInfoTitle", "postInfoBlogId", "postInfoBlogName", "postInfoBlogOwnerId", "commentatorInfoUserId", "commentatorInfoUserLogin", "commentatorInfoIsBanned", "likesInfoLikesCount", "likesInfoDislikesCount", "likesInfoMyStatus", "banInfoIsBanned", "banInfoBanDate", "banInfoBanReason"
        FROM public."Comments"
        WHERE "id" = $1
          `,
        [commentId],
      );
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }
  async totalCount(
    postInfoBlogOwnerId: string,
    commentatorInfoIsBanned: boolean,
    banInfoIsBanned: boolean,
  ): Promise<number> {
    try {
      const countBlogs = await this.db.query(
        `
        SELECT count(*)
        FROM public."Comments"
        WHERE "postInfoBlogOwnerId" = $1 AND "commentatorInfoIsBanned" = $2 AND "banInfoIsBanned" = $3
      `,
        [postInfoBlogOwnerId, commentatorInfoIsBanned, banInfoIsBanned],
      );
      return Number(countBlogs[0].count);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}

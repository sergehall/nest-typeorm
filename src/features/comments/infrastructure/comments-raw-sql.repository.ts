import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { TablesCommentsRawSqlEntity } from '../entities/tables-comments-raw-sql.entity';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { ParseQueryType } from '../../common/parse-query/parse-query';
import { BannedUsersForBlogsEntity } from '../../blogger-blogs/entities/banned-users-for-blogs.entity';

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
        "postInfoPostId", "postInfoTitle", "postInfoBlogId", "postInfoBlogName", "postInfoBlogOwnerId", 
        "commentatorInfoUserId", "commentatorInfoUserLogin", "commentatorInfoIsBanned", 
        "banInfoIsBanned", "banInfoBanDate", "banInfoBanReason")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING "id", "content", "createdAt" "commentatorInfoUserId", "commentatorInfoUserLogin"
          `,
        [
          tablesCommentsRawSqlEntity.id,
          tablesCommentsRawSqlEntity.content,
          tablesCommentsRawSqlEntity.createdAt,
          tablesCommentsRawSqlEntity.postInfoPostId,
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
    queryData: ParseQueryType,
    postInfoBlogOwnerId: string,
    commentatorInfoIsBanned: boolean,
    banInfoIsBanned: boolean,
  ): Promise<TablesCommentsRawSqlEntity[]> {
    try {
      const direction = [-1, 'ascending', 'ASCENDING', 'asc', 'ASC'].includes(
        queryData.queryPagination.sortDirection,
      )
        ? 'ASC'
        : 'DESC';
      const orderByDirection = `"${queryData.queryPagination.sortBy}" ${direction}`;
      return await this.db.query(
        `
        SELECT "id", "content", "createdAt", 
        "postInfoPostId", "postInfoTitle", "postInfoBlogId", "postInfoBlogName", "postInfoBlogOwnerId",
         "commentatorInfoUserId", "commentatorInfoUserLogin", "commentatorInfoIsBanned", 
         "banInfoIsBanned", "banInfoBanDate", "banInfoBanReason"
        FROM public."Comments"
        WHERE "postInfoBlogOwnerId" = $1 AND "commentatorInfoIsBanned" = $2 
        AND "banInfoIsBanned" = $3
        ORDER BY ${orderByDirection}
        LIMIT $4 OFFSET $5
          `,
        [
          postInfoBlogOwnerId,
          commentatorInfoIsBanned,
          banInfoIsBanned,
          queryData.queryPagination.pageSize,
          queryData.queryPagination.pageNumber - 1,
        ],
      );
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateComment(
    commentId: string,
    updateCommentDto: UpdateCommentDto,
  ): Promise<boolean> {
    try {
      const updateUser = await this.db.query(
        `
      UPDATE public."Comments"
      SET  "content" = $2
      WHERE "id" = $1`,
        [commentId, updateCommentDto.content],
      );
      return !!updateUser[0];
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async changeBanStatusCommentatorsByUserId(
    userId: string,
    isBanned: boolean,
  ): Promise<boolean> {
    try {
      const updateComments = await this.db.query(
        `
      UPDATE public."Comments"
      SET "commentatorInfoIsBanned" = $2
      WHERE "commentatorInfoUserId" = $1`,
        [userId, isBanned],
      );
      return !!updateComments[0];
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findCommentByCommentId(
    commentId: string,
  ): Promise<TablesCommentsRawSqlEntity | null> {
    try {
      const commentatorInfoIsBanned = false;
      const banInfoIsBanned = false;
      const comment = await this.db.query(
        `
        SELECT "id", "content", "createdAt", 
        "postInfoPostId", "postInfoTitle", "postInfoBlogId", "postInfoBlogName", "postInfoBlogOwnerId", 
        "commentatorInfoUserId", "commentatorInfoUserLogin", "commentatorInfoIsBanned", 
        "banInfoIsBanned", "banInfoBanDate", "banInfoBanReason"
        FROM public."Comments"
        WHERE "id" = $1 AND "commentatorInfoIsBanned" = $2 AND "banInfoIsBanned" = $3
          `,
        [commentId, commentatorInfoIsBanned, banInfoIsBanned],
      );
      return comment[0];
    } catch (error) {
      console.log(error.message);
      return null;
    }
  }

  async findCommentsByPostId(
    postId: string,
    queryData: ParseQueryType,
  ): Promise<TablesCommentsRawSqlEntity[]> {
    try {
      const offset = queryData.queryPagination.pageNumber - 1;
      const commentatorInfoIsBanned = false;
      const banInfoIsBanned = false;
      const orderByDirection = `"${queryData.queryPagination.sortBy}" ${queryData.queryPagination.sortDirection}`;
      return await this.db.query(
        `
        SELECT "id", "content", "createdAt",
         "postInfoPostId", "postInfoTitle", "postInfoBlogId", "postInfoBlogName", "postInfoBlogOwnerId",
          "commentatorInfoUserId", "commentatorInfoUserLogin", "commentatorInfoIsBanned", 
          "banInfoIsBanned", "banInfoBanDate", "banInfoBanReason"
        FROM public."Comments"
        WHERE "postInfoId" = $1 AND "commentatorInfoIsBanned" = $2 AND "banInfoIsBanned" = $3
        ORDER BY ${orderByDirection}
        LIMIT $4 OFFSET $5
          `,
        [
          postId,
          commentatorInfoIsBanned,
          banInfoIsBanned,
          queryData.queryPagination.pageSize,
          offset,
        ],
      );
    } catch (error) {
      console.log(error.message);
      throw new NotFoundException(error.message);
    }
  }

  async removeCommentByCommentId(commentId: string): Promise<boolean> {
    try {
      const comment = await this.db.query(
        `
        DELETE FROM public."Comments"
        WHERE "id" = $1
        RETURNING "id"
          `,
        [commentId],
      );
      return comment[1] === 1;
    } catch (error) {
      console.log(error.message);
      throw new NotFoundException(error.message);
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
  async changeBanStatusCommentsByUserIdBlogId(
    bannedUserForBlogEntity: BannedUsersForBlogsEntity,
  ): Promise<boolean> {
    try {
      return await this.db.query(
        `
      UPDATE public."Comments"
      SET "banInfoIsBanned" = $3, "banInfoBanDate" = $4, "banInfoBanReason" = $5 
      WHERE "commentatorInfoUserId" = $1 AND "postInfoBlogId" = $2`,
        [
          bannedUserForBlogEntity.userId,
          bannedUserForBlogEntity.blogId,
          bannedUserForBlogEntity.isBanned,
          bannedUserForBlogEntity.banDate,
          bannedUserForBlogEntity.banReason,
        ],
      );
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }
  async changeBanStatusCommentsByBlogId(
    blogId: string,
    isBanned: boolean,
  ): Promise<boolean> {
    try {
      return await this.db.query(
        `
      UPDATE public."Comments"
      SET "banInfoIsBanned" = $2
      WHERE "postInfoBlogId" = $1
      `,
        [blogId, isBanned],
      );
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async deleteLikePostUserByUserId(userId: string): Promise<boolean> {
    try {
      return await this.db.query(
        `
        DELETE FROM public."LikeStatusPosts"
        WHERE "userId" = $1
        `,
        [userId],
      );
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }
  async removeCommentsByUserId(userId: string): Promise<boolean> {
    try {
      return await this.db.query(
        `
        DELETE FROM public."Comments"
        WHERE "commentatorInfoUserId" = $1
          `,
        [userId],
      );
    } catch (error) {
      console.log(error.message);
      throw new NotFoundException(error.message);
    }
  }
}

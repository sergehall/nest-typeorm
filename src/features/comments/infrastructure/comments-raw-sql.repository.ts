import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { TablesCommentsRawSqlEntity } from '../entities/tables-comments-raw-sql.entity';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { BannedUsersForBlogsEntity } from '../../blogger-blogs/entities/banned-users-for-blogs.entity';
import { ParseQueriesType } from '../../common/query/types/parse-query.types';
import { KeyArrayProcessor } from '../../common/query/get-key-from-array-or-default';

export class CommentsRawSqlRepository {
  constructor(
    @InjectDataSource() private readonly db: DataSource,
    protected keyArrayProcessor: KeyArrayProcessor,
  ) {}
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

  async findCommentsByCommentatorId(
    queryData: ParseQueriesType,
    commentatorInfoUserId: string,
  ): Promise<TablesCommentsRawSqlEntity[]> {
    const commentatorInfoIsBanned = false;
    const banInfoIsBanned = false;
    const sortBy = await this.getSortBy(queryData.queryPagination.sortBy);
    const limit = queryData.queryPagination.pageSize;
    const offset =
      (queryData.queryPagination.pageNumber - 1) *
      queryData.queryPagination.pageSize;
    const direction = queryData.queryPagination.sortDirection;

    try {
      return await this.db.query(
        `
        SELECT "id", "content", "createdAt", 
        "postInfoPostId", "postInfoTitle", "postInfoBlogId", "postInfoBlogName", "postInfoBlogOwnerId",
         "commentatorInfoUserId", "commentatorInfoUserLogin", "commentatorInfoIsBanned", 
         "banInfoIsBanned", "banInfoBanDate", "banInfoBanReason"
        FROM public."Comments"
        WHERE "commentatorInfoUserId" = $1 AND "commentatorInfoIsBanned" = $2 AND "banInfoIsBanned" = $3
        ORDER BY "${sortBy}" ${direction}
        LIMIT $4 OFFSET $5
          `,
        [
          commentatorInfoUserId,
          commentatorInfoIsBanned,
          banInfoIsBanned,
          limit,
          offset,
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
      WHERE "commentatorInfoUserId" = $1 OR "postInfoBlogOwnerId" = $1
      `,
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
    queryData: ParseQueriesType,
  ): Promise<TablesCommentsRawSqlEntity[]> {
    try {
      const commentatorInfoIsBanned = false;
      const banInfoIsBanned = false;
      const sortBy = await this.getSortBy(queryData.queryPagination.sortBy);
      const direction = queryData.queryPagination.sortDirection;
      const limit = queryData.queryPagination.pageSize;
      const offset =
        (queryData.queryPagination.pageNumber - 1) *
        queryData.queryPagination.pageSize;
      return await this.db.query(
        `
        SELECT "id", "content", "createdAt", "postInfoPostId", "postInfoTitle", "postInfoBlogId", "postInfoBlogName", "postInfoBlogOwnerId", "commentatorInfoUserId", "commentatorInfoUserLogin", "commentatorInfoIsBanned", "banInfoIsBanned", "banInfoBanDate", "banInfoBanReason"
        FROM public."Comments"
        WHERE "postInfoPostId" = $1 AND "commentatorInfoIsBanned" = $2 AND "banInfoIsBanned" = $3
        ORDER BY "${sortBy}" ${direction}
        LIMIT $4 OFFSET $5
          `,
        [postId, commentatorInfoIsBanned, banInfoIsBanned, limit, offset],
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

  async totalCountCommentsByPostId(postId: string): Promise<number> {
    const commentatorInfoIsBanned = false;
    const banInfoIsBanned = false;
    try {
      const countBlogs = await this.db.query(
        `
        SELECT count(*)
        FROM public."Comments"
        WHERE "postInfoPostId" = $1 AND "commentatorInfoIsBanned" = $2 AND "banInfoIsBanned" = $3
      `,
        [postId, commentatorInfoIsBanned, banInfoIsBanned],
      );
      return Number(countBlogs[0].count);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async totalCountCommentsByCommentatorId(
    commentatorInfoUserId: string,
  ): Promise<number> {
    const commentatorInfoIsBanned = false;
    const banInfoIsBanned = false;
    try {
      const countBlogs = await this.db.query(
        `
        SELECT count(*)
        FROM public."Comments"
        WHERE "commentatorInfoUserId" = $1 AND "commentatorInfoIsBanned" = $2 AND "banInfoIsBanned" = $3
      `,
        [commentatorInfoUserId, commentatorInfoIsBanned, banInfoIsBanned],
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

  async changeIntoCommentsBlogOwner(
    blogId: string,
    userId: string,
  ): Promise<boolean> {
    try {
      return await this.db.query(
        `
        UPDATE public."Comments"
        SET "postInfoBlogOwnerId" = $2
        WHERE "postInfoBlogId" = $1
        `,
        [blogId, userId],
      );
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async removeCommentsByBlogId(blogId: string): Promise<boolean> {
    try {
      return await this.db.query(
        `
        DELETE FROM public."Comments"
        WHERE "postInfoBlogId" = $1
          `,
        [blogId],
      );
    } catch (error) {
      console.log(error.message);
      throw new NotFoundException(error.message);
    }
  }

  async removeCommentsByPostId(postId: string): Promise<boolean> {
    try {
      return await this.db.query(
        `
        DELETE FROM public."Comments"
        WHERE "postInfoPostId" = $1
          `,
        [postId],
      );
    } catch (error) {
      console.log(error.message);
      throw new NotFoundException(error.message);
    }
  }
  private async getSortBy(sortBy: string): Promise<string> {
    return await this.keyArrayProcessor.getKeyFromArrayOrDefault(
      sortBy,
      [
        'content',
        'postInfoTitle',
        'postInfoBlogName',
        'commentatorInfoUserLogin',
        'commentatorInfoIsBanned',
        'banInfoIsBanned',
        'banInfoBanDate',
      ],
      'createdAt',
    );
  }
}

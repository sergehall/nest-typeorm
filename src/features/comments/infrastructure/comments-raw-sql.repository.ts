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
import { CurrentUserDto } from '../../users/dto/currentUser.dto';
import { CommentsNumberOfLikesDislikesLikesStatus } from '../entities/comment-likes-dislikes-likes-status';
import { TablesCommentsCountOfLikesDislikesComments } from '../entities/comment-by-id-count-likes-dislikes';
import { loginOrEmailAlreadyExists } from '../../../exception-filter/custom-errors-messages';

export class CommentsRawSqlRepository {
  constructor(
    @InjectDataSource() private readonly db: DataSource,
    protected keyArrayProcessor: KeyArrayProcessor,
  ) {}

  async createComment(
    tablesCommentsRawSqlEntity: TablesCommentsRawSqlEntity,
  ): Promise<TablesCommentsRawSqlEntity[]> {
    try {
      return await this.db.query(
        `
        INSERT INTO public."Comments"(
          "id", "content", "createdAt", 
          "postInfoPostId", "postInfoTitle", "postInfoBlogId", "postInfoBlogName", "postInfoBlogOwnerId", 
          "commentatorInfoUserId", "commentatorInfoUserLogin", "commentatorInfoIsBanned", 
          "banInfoIsBanned", "banInfoBanDate", "banInfoBanReason")
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          RETURNING *
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
      return updateUser[1] === 1;
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
  async findCommentByIdAndCountOfLikesDislikesComments(
    commentId: string,
    currentUserDto: CurrentUserDto | null,
  ): Promise<TablesCommentsCountOfLikesDislikesComments | null> {
    try {
      const commentatorInfoIsBanned = false;
      const banInfoIsBanned = false;
      const isBanned = false;

      const parameters = [
        commentId,
        currentUserDto?.id,
        isBanned,
        commentatorInfoIsBanned,
        banInfoIsBanned,
      ];

      const query = `
        SELECT
            c."id", c."content", c."createdAt", c."postInfoPostId", c."postInfoTitle",
            c."postInfoBlogId", c."postInfoBlogName",
            c."postInfoBlogOwnerId", c."commentatorInfoUserId", c."commentatorInfoUserLogin",
            c."commentatorInfoIsBanned", c."banInfoIsBanned", c."banInfoBanDate", c."banInfoBanReason",
            COALESCE(lc."countLikes", 0) AS "countLikes",
            COALESCE(lc."countDislikes", 0) AS "countDislikes",
            COALESCE(ls."likeStatus", 'None') AS "myStatus"
            FROM public."Comments" c
            LEFT JOIN (
                SELECT "commentId",
                    SUM(CASE WHEN "likeStatus" = 'Like' THEN 1 ELSE 0 END)::integer AS "countLikes",
                    SUM(CASE WHEN "likeStatus" = 'Dislike' THEN 1 ELSE 0 END)::integer AS "countDislikes"
                FROM public."LikeStatusComments"
                WHERE "isBanned" = $3
                GROUP BY "commentId"
            ) lc ON c."id" = lc."commentId"
            LEFT JOIN (
                SELECT "commentId", "likeStatus"
                FROM public."LikeStatusComments"
                WHERE "userId" = $2 AND "isBanned" = $3
            ) ls ON c."id" = ls."commentId"
            WHERE 
                c."id" = $1
                AND c."commentatorInfoIsBanned" = $4
                AND c."banInfoIsBanned" = $5;
      `;

      const comment = await this.db.query(query, parameters);

      return comment[0] ? comment[0] : null;
    } catch (error) {
      console.log(error.message);
      if (error.message.includes('invalid input syntax for type uuid:')) {
        loginOrEmailAlreadyExists.field = error.message.match(/"(.*?)"/)[1];
        throw new NotFoundException('Not found comment.');
      }
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
  async findComments(
    postId: string,
    queryData: ParseQueriesType,
    currentUserDto: CurrentUserDto | null,
  ): Promise<CommentsNumberOfLikesDislikesLikesStatus[]> {
    try {
      const commentatorInfoIsBanned = false;
      const banInfoIsBanned = false;
      const isBanned = false;

      const sortBy = await this.getSortBy(queryData.queryPagination.sortBy);
      const direction = queryData.queryPagination.sortDirection;
      const limit = queryData.queryPagination.pageSize;
      const offset =
        (queryData.queryPagination.pageNumber - 1) *
        queryData.queryPagination.pageSize;

      const query = `
      SELECT
        c."id", c."content", c."createdAt", c."postInfoPostId", c."postInfoTitle",
        c."postInfoBlogId", c."postInfoBlogName", c."postInfoBlogOwnerId",
        c."commentatorInfoUserId", c."commentatorInfoUserLogin", c."commentatorInfoIsBanned",
        c."banInfoIsBanned", c."banInfoBanDate", c."banInfoBanReason",
        CAST(
        (
          SELECT COUNT(*)
          FROM public."Comments"
          WHERE "postInfoPostId" = $1
          AND "commentatorInfoIsBanned" = $2
          AND "banInfoIsBanned" = $3
          ) AS integer
        ) AS "numberOfComments",
        COALESCE(lsc_like."numberOfLikes"::integer, 0) AS "numberOfLikes",
        COALESCE(lsc_dislike."numberOfDislikes"::integer, 0) AS "numberOfDislikes",
        COALESCE(lsc_user."likeStatus", 'None') AS "likeStatus"
      FROM public."Comments" c
      LEFT JOIN (
        SELECT "commentId", COUNT(*) AS "numberOfLikes"
        FROM public."LikeStatusComments"
        WHERE "likeStatus" = 'Like' AND "isBanned" = $5
        GROUP BY "commentId"
      ) lsc_like ON c."id" = lsc_like."commentId"
      LEFT JOIN (
        SELECT "commentId", COUNT(*) AS "numberOfDislikes"
        FROM public."LikeStatusComments"
        WHERE "likeStatus" = 'Dislike' AND "isBanned" = $5
        GROUP BY "commentId"
      ) lsc_dislike ON c."id" = lsc_dislike."commentId"
      LEFT JOIN (
        SELECT "commentId", "likeStatus"
        FROM public."LikeStatusComments"
        WHERE "userId" = $4 AND "isBanned" = $5
      ) lsc_user ON c."id" = lsc_user."commentId"
      WHERE c."postInfoPostId" = $1
        AND c."commentatorInfoIsBanned" = $2
        AND c."banInfoIsBanned" = $3
      ORDER BY "${sortBy}" ${direction}
      LIMIT $6 OFFSET $7`;

      const parameters = [
        postId,
        commentatorInfoIsBanned,
        banInfoIsBanned,
        currentUserDto?.id,
        isBanned,
        limit,
        offset,
      ];

      return await this.db.query(query, parameters);
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async findCommentsByUserNotExist(
    postId: string,
    queryData: ParseQueriesType,
  ): Promise<CommentsNumberOfLikesDislikesLikesStatus[]> {
    try {
      const commentatorInfoIsBanned = false;
      const banInfoIsBanned = false;
      const isBanned = false;

      const sortBy = await this.getSortBy(queryData.queryPagination.sortBy);
      const direction = queryData.queryPagination.sortDirection;
      const limit = queryData.queryPagination.pageSize;
      const offset =
        (queryData.queryPagination.pageNumber - 1) *
        queryData.queryPagination.pageSize;

      const query = `
        SELECT
          c."id", c."content", c."createdAt", c."postInfoPostId", c."postInfoTitle",
          c."postInfoBlogId", c."postInfoBlogName", c."postInfoBlogOwnerId",
          c."commentatorInfoUserId", c."commentatorInfoUserLogin", c."commentatorInfoIsBanned",
          c."banInfoIsBanned", c."banInfoBanDate", c."banInfoBanReason",
          CAST(
          (
            SELECT COUNT(*)
            FROM public."Comments"
            WHERE "postInfoPostId" = $1
            AND "commentatorInfoIsBanned" = $2
            AND "banInfoIsBanned" = $3
            ) AS integer
          ) AS "numberOfComments",
          COALESCE((
            SELECT COUNT(*)
            FROM public."LikeStatusComments"
            WHERE "commentId" = c."id"
            AND "likeStatus" = 'Like'
            AND "isBanned" = $6
          )::integer, 0) AS "numberOfLikes",
          COALESCE((
            SELECT COUNT(*)
            FROM public."LikeStatusComments"
            WHERE "commentId" = c."id"
            AND "likeStatus" = 'Dislike'
            AND "isBanned" = $6
          )::integer, 0) AS "numberOfDislikes",
          'None' AS "likeStatus"
        FROM public."Comments" c
        WHERE c."postInfoPostId" = $1
          AND c."commentatorInfoIsBanned" = $2
          AND c."banInfoIsBanned" = $3
        ORDER BY "${sortBy}" ${direction}
        LIMIT $4 OFFSET $5
        `;

      const parameters = [
        postId,
        commentatorInfoIsBanned,
        banInfoIsBanned,
        limit,
        offset,
        isBanned,
      ];
      const result = await this.db.query(query, parameters);
      console.log(result);
      return result;
      // return await this.db.query(query, parameters);
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async findCommentsByUserExist(
    postId: string,
    queryData: ParseQueriesType,
    currentUserDto: CurrentUserDto,
  ): Promise<CommentsNumberOfLikesDislikesLikesStatus[]> {
    try {
      const commentatorInfoIsBanned = false;
      const banInfoIsBanned = false;
      const isBanned = false;

      const sortBy = await this.getSortBy(queryData.queryPagination.sortBy);
      const direction = queryData.queryPagination.sortDirection;
      const limit = queryData.queryPagination.pageSize;
      const offset =
        (queryData.queryPagination.pageNumber - 1) *
        queryData.queryPagination.pageSize;

      const query = `
      SELECT
        c."id", c."content", c."createdAt", c."postInfoPostId", c."postInfoTitle",
        c."postInfoBlogId", c."postInfoBlogName", c."postInfoBlogOwnerId",
        c."commentatorInfoUserId", c."commentatorInfoUserLogin", c."commentatorInfoIsBanned",
        c."banInfoIsBanned", c."banInfoBanDate", c."banInfoBanReason",
        CAST(
        (
          SELECT COUNT(*)
          FROM public."Comments"
          WHERE "postInfoPostId" = $1
          AND "commentatorInfoIsBanned" = $2
          AND "banInfoIsBanned" = $3
          ) AS integer
        ) AS "numberOfComments",
        COALESCE(lsc_like."numberOfLikes"::integer, 0) AS "numberOfLikes",
        COALESCE(lsc_dislike."numberOfDislikes"::integer, 0) AS "numberOfDislikes",
        COALESCE(lsc_user."likeStatus", 'None') AS "likeStatus"
      FROM public."Comments" c
      LEFT JOIN (
        SELECT "commentId", COUNT(*) AS "numberOfLikes"
        FROM public."LikeStatusComments"
        WHERE "likeStatus" = 'Like' AND "isBanned" = $5
        GROUP BY "commentId"
      ) lsc_like ON c."id" = lsc_like."commentId"
      LEFT JOIN (
        SELECT "commentId", COUNT(*) AS "numberOfDislikes"
        FROM public."LikeStatusComments"
        WHERE "likeStatus" = 'Dislike' AND "isBanned" = $5
        GROUP BY "commentId"
      ) lsc_dislike ON c."id" = lsc_dislike."commentId"
      LEFT JOIN (
        SELECT "commentId", "likeStatus"
        FROM public."LikeStatusComments"
        WHERE "userId" = $4 AND "isBanned" = $5
      ) lsc_user ON c."id" = lsc_user."commentId"
      WHERE c."postInfoPostId" = $1
        AND c."commentatorInfoIsBanned" = $2
        AND c."banInfoIsBanned" = $3
      ORDER BY "${sortBy}" ${direction}
      LIMIT $6 OFFSET $7`;

      const parameters = [
        postId,
        commentatorInfoIsBanned,
        banInfoIsBanned,
        currentUserDto.id,
        isBanned,
        limit,
        offset,
      ];

      return await this.db.query(query, parameters);
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
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

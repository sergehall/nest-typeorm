import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { BannedUsersForBlogsEntity } from '../../blogger-blogs/entities/banned-users-for-blogs.entity';
import { CurrentUserDto } from '../../users/dto/currentUser.dto';
import { loginOrEmailAlreadyExists } from '../../../common/filters/custom-errors-messages';
import { TablesCommentsEntity } from '../entities/tables-comments.entity';
import { BannedFlagsDto } from '../../posts/dto/banned-flags.dto';
import { CommentsCountLikesDislikesEntity } from '../entities/comments-count-likes-dislikes.entity';
import { KeyResolver } from '../../../common/helpers/key-resolver';
import { ParseQueriesDto } from '../../../common/query/dto/parse-queries.dto';

export class CommentsRawSqlRepository {
  constructor(
    @InjectDataSource() private readonly db: DataSource,
    protected keyResolver: KeyResolver,
  ) {}

  async createComment(
    tablesCommentsRawSqlEntity: TablesCommentsEntity,
  ): Promise<TablesCommentsEntity[]> {
    try {
      return await this.db.query(
        `
        INSERT INTO public."Comments"(
          "id", "content", "createdAt", "postInfoPostId", "postInfoTitle", "postInfoBlogId",
          "postInfoBlogName", "postInfoBlogOwnerId", 
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

  async findAllNotBannedCommentsAndCountLikesDislikes(
    commentatorInfoUserId: string,
    queryData: ParseQueriesDto,
    currentUserDto: CurrentUserDto | null,
  ): Promise<CommentsCountLikesDislikesEntity[]> {
    try {
      const bannedFlags: BannedFlagsDto = await this.getBannedFlags();
      const { commentatorInfoIsBanned, banInfoIsBanned, isBanned } =
        bannedFlags;
      const { pageNumber, pageSize, sortDirection } = queryData.queryPagination;

      const sortBy = await this.getSortBy(queryData.queryPagination.sortBy);
      const direction = sortDirection;
      const limit = pageSize;
      const offset = (pageNumber - 1) * limit;

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
          WHERE "commentatorInfoIsBanned" = $2 AND "banInfoIsBanned" = $3
          ) AS integer
        ) AS "countComments",
        COALESCE(lsc_like."countLikes"::integer, 0) AS "countLikes",
        COALESCE(lsc_dislike."countDislikes"::integer, 0) AS "countDislikes",
        COALESCE(lsc_user."likeStatus", 'None') AS "likeStatus"
      FROM public."Comments" c
      LEFT JOIN (
        SELECT "commentId", COUNT(*) AS "countLikes"
        FROM public."LikeStatusComments"
        WHERE "likeStatus" = 'Like' AND "isBanned" = $4
        GROUP BY "commentId"
      ) lsc_like ON c."id" = lsc_like."commentId"
      LEFT JOIN (
        SELECT "commentId", COUNT(*) AS "countDislikes"
        FROM public."LikeStatusComments"
        WHERE "likeStatus" = 'Dislike' AND "isBanned" = $4
        GROUP BY "commentId"
      ) lsc_dislike ON c."id" = lsc_dislike."commentId"
      LEFT JOIN (
        SELECT "commentId", "likeStatus"
        FROM public."LikeStatusComments"
        WHERE "userId" = $1 AND "isBanned" = $4
      ) lsc_user ON c."id" = lsc_user."commentId"
      WHERE  c."commentatorInfoIsBanned" = $2 AND c."banInfoIsBanned" = $3
      ORDER BY "${sortBy}" ${direction}
      LIMIT $5 OFFSET $6`;

      const parameters = [
        currentUserDto?.id,
        commentatorInfoIsBanned,
        banInfoIsBanned,
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

  async findCommentByCommentatorIdAndCountOfLikesDislikesComments2(
    commentatorInfoUserId: string,
    queryData: ParseQueriesDto,
    currentUserDto: CurrentUserDto | null,
  ): Promise<CommentsCountLikesDislikesEntity[]> {
    try {
      const bannedFlags: BannedFlagsDto = await this.getBannedFlags();
      const { commentatorInfoIsBanned, banInfoIsBanned, isBanned } =
        bannedFlags;
      const { pageNumber, pageSize, sortDirection } = queryData.queryPagination;

      const sortBy = await this.getSortBy(queryData.queryPagination.sortBy);
      const direction = sortDirection;
      const limit = pageSize;
      const offset = (pageNumber - 1) * limit;

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
          WHERE "commentatorInfoUserId" = $1
          AND "commentatorInfoIsBanned" = $2
          AND "banInfoIsBanned" = $3
          ) AS integer
        ) AS "countComments",
        COALESCE(lsc_like."countLikes"::integer, 0) AS "countLikes",
        COALESCE(lsc_dislike."countDislikes"::integer, 0) AS "countDislikes",
        COALESCE(lsc_user."likeStatus", 'None') AS "likeStatus"
      FROM public."Comments" c
      LEFT JOIN (
        SELECT "commentId", COUNT(*) AS "countLikes"
        FROM public."LikeStatusComments"
        WHERE "likeStatus" = 'Like' AND "isBanned" = $5
        GROUP BY "commentId"
      ) lsc_like ON c."id" = lsc_like."commentId"
      LEFT JOIN (
        SELECT "commentId", COUNT(*) AS "countDislikes"
        FROM public."LikeStatusComments"
        WHERE "likeStatus" = 'Dislike' AND "isBanned" = $5
        GROUP BY "commentId"
      ) lsc_dislike ON c."id" = lsc_dislike."commentId"
      LEFT JOIN (
        SELECT "commentId", "likeStatus"
        FROM public."LikeStatusComments"
        WHERE "userId" = $4 AND "isBanned" = $5
      ) lsc_user ON c."id" = lsc_user."commentId"
      WHERE c."commentatorInfoUserId" = $1
        AND c."commentatorInfoIsBanned" = $2
        AND c."banInfoIsBanned" = $3
      ORDER BY "${sortBy}" ${direction}
      LIMIT $6 OFFSET $7`;

      const parameters = [
        commentatorInfoUserId,
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

  async findCommentsByPostIdAndCountOfLikesDislikes(
    postId: string,
    queryData: ParseQueriesDto,
    currentUserDto: CurrentUserDto | null,
  ): Promise<CommentsCountLikesDislikesEntity[]> {
    try {
      const { pageSize, pageNumber, sortBy, sortDirection } =
        queryData.queryPagination;
      const bannedFlags: BannedFlagsDto = await this.getBannedFlags();
      const { commentatorInfoIsBanned, banInfoIsBanned, isBanned } =
        bannedFlags;

      const field = await this.getSortBy(sortBy);
      const direction = sortDirection;
      const limit = pageSize;
      const offset = (pageNumber - 1) * limit;

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
        ) AS "countComments",
        COALESCE(lsc_like."countLikes"::integer, 0) AS "countLikes",
        COALESCE(lsc_dislike."countDislikes"::integer, 0) AS "countDislikes",
        COALESCE(lsc_user."likeStatus", 'None') AS "likeStatus"
      FROM public."Comments" c
      LEFT JOIN (
        SELECT "commentId", COUNT(*) AS "countLikes"
        FROM public."LikeStatusComments"
        WHERE "likeStatus" = 'Like' AND "isBanned" = $5
        GROUP BY "commentId"
      ) lsc_like ON c."id" = lsc_like."commentId"
      LEFT JOIN (
        SELECT "commentId", COUNT(*) AS "countDislikes"
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
      ORDER BY "${field}" ${direction}
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

  async findCommentByIdAndCountOfLikesDislikesComments(
    commentId: string,
    currentUserDto: CurrentUserDto | null,
  ): Promise<CommentsCountLikesDislikesEntity | null> {
    try {
      const bannedFlags: BannedFlagsDto = await this.getBannedFlags();
      const { commentatorInfoIsBanned, banInfoIsBanned, isBanned } =
        bannedFlags;

      const query = `
        SELECT
            c."id", c."content", c."createdAt", c."postInfoPostId", c."postInfoTitle",
            c."postInfoBlogId", c."postInfoBlogName",
            c."postInfoBlogOwnerId", c."commentatorInfoUserId", c."commentatorInfoUserLogin",
            c."commentatorInfoIsBanned", c."banInfoIsBanned", c."banInfoBanDate", c."banInfoBanReason",
            COALESCE(lc."countLikes", 0) AS "countLikes",
            COALESCE(lc."countDislikes", 0) AS "countDislikes",
            COALESCE(ls."likeStatus", 'None') AS "likeStatus"
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

      const parameters = [
        commentId,
        currentUserDto?.id,
        isBanned,
        commentatorInfoIsBanned,
        banInfoIsBanned,
      ];

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
  ): Promise<TablesCommentsEntity | null> {
    try {
      const bannedFlags: BannedFlagsDto = await this.getBannedFlags();
      const { commentatorInfoIsBanned, banInfoIsBanned } = bannedFlags;

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

  async changeBanStatusCommentsByUserIdBlogId(
    bannedUserForBlogEntity: BannedUsersForBlogsEntity,
  ): Promise<boolean> {
    const { userId, blogId, isBanned, banDate, banReason } =
      bannedUserForBlogEntity;
    try {
      return await this.db.query(
        `
      UPDATE public."Comments"
      SET "banInfoIsBanned" = $3, "banInfoBanDate" = $4, "banInfoBanReason" = $5 
      WHERE "commentatorInfoUserId" = $1 AND "postInfoBlogId" = $2`,
        [userId, blogId, isBanned, banDate, banReason],
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

  private async getBannedFlags(): Promise<BannedFlagsDto> {
    return {
      commentatorInfoIsBanned: false,
      dependencyIsBanned: false,
      banInfoIsBanned: false,
      isBanned: false,
    };
  }

  private async getSortBy(sortBy: string): Promise<string> {
    return await this.keyResolver.resolveKey(
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

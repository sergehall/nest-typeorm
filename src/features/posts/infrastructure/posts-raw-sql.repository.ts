import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UpdatePostDto } from '../dto/update-post.dto';
import { TablesPostsEntity } from '../entities/tables-posts-entity';
import { BlogIdParams } from '../../common/query/params/blogId.params';
import { ParseQueriesType } from '../../common/query/types/parse-query.types';
import { KeyArrayProcessor } from '../../common/query/get-key-from-array-or-default';
import { CurrentUserDto } from '../../users/dto/currentUser.dto';
import { PostsNumbersOfPostsLikesDislikesLikesStatus } from '../entities/posts-number-of-likes-dislikes-likes-status';
import { ReturnPostsEntity } from '../entities/return-posts-entity.entity';
import { LikeStatusEnums } from '../../../config/db/mongo/enums/like-status.enums';
import { BannedFlagsDto } from '../dto/banned-flags.dto';
import { PagingParamsDto } from '../dto/paging-params.dto';
import { ReturnPostsNumberOfPostsEntity } from '../entities/return-posts-number-of-posts.entity';

export class PostsRawSqlRepository {
  constructor(
    @InjectDataSource() private readonly db: DataSource,
    protected keyArrayProcessor: KeyArrayProcessor,
  ) {}
  async findPostsAndTotalCountPosts(
    queryData: ParseQueriesType,
    currentUserDto: CurrentUserDto | null,
  ): Promise<ReturnPostsNumberOfPostsEntity> {
    try {
      const bannedFlags: BannedFlagsDto = await this.getBannedFlags();

      const pagingParams: PagingParamsDto = await this.getPagingParams(
        queryData,
      );

      const postsWithLikes: PostsNumbersOfPostsLikesDislikesLikesStatus[] =
        await this.getPostsWithLikes(bannedFlags, pagingParams);

      const posts: ReturnPostsEntity[] = await this.processPostsWithLikes(
        postsWithLikes,
        currentUserDto,
      );

      return {
        posts,
        numberOfPosts: postsWithLikes[0].numberOfPosts,
      };
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  private async getPagingParams(
    queryData: ParseQueriesType,
  ): Promise<PagingParamsDto> {
    const sortBy = await this.getSortBy(queryData.queryPagination.sortBy);
    const direction = queryData.queryPagination.sortDirection;
    const limit = queryData.queryPagination.pageSize;
    const offset = (queryData.queryPagination.pageNumber - 1) * limit;

    return { sortBy, direction, limit, offset };
  }

  private async getBannedFlags(): Promise<BannedFlagsDto> {
    return {
      dependencyIsBanned: false,
      banInfoIsBanned: false,
      isBanned: false,
    };
  }

  private async getPostsWithLikes(
    bannedFlags: BannedFlagsDto,
    pagingParams: PagingParamsDto,
  ): Promise<PostsNumbersOfPostsLikesDislikesLikesStatus[]> {
    const { dependencyIsBanned, banInfoIsBanned, isBanned } = bannedFlags;
    const { sortBy, direction, limit, offset } = pagingParams;

    const parameters = [
      dependencyIsBanned,
      banInfoIsBanned,
      isBanned,
      limit,
      offset,
    ];
    const query = `
          WITH LastThreeLikes AS (
            SELECT
              "postId", "userId", "likeStatus", "addedAt", "login",
              ROW_NUMBER() OVER (PARTITION BY "postId" ORDER BY "addedAt" DESC) AS rn
            FROM public."LikeStatusPosts"
            WHERE "isBanned" = $3
            ),
            PostsWithLikes AS (
              SELECT
                p.id, p.title, p."shortDescription", p.content, p."blogId", p."blogName",
                p."createdAt", p."postOwnerId", p."dependencyIsBanned", p."banInfoIsBanned",
                p."banInfoBanDate", p."banInfoBanReason",
                COALESCE(l."userId") AS "userId",
                COALESCE(l."likeStatus", 'None') AS "likeStatus",
                COALESCE(l."addedAt", '') AS "addedAt",
                COALESCE(l.login, '') AS "login",
                COALESCE(lsc_like."numberOfLikes", 0) AS "likesCount",
                COALESCE(lsc_dislike."numberOfDislikes", 0) AS "dislikesCount"
              FROM public."Posts" p
              LEFT JOIN LastThreeLikes l ON p.id = l."postId" AND l.rn <= 3
              LEFT JOIN (
                SELECT "postId", COUNT(*) AS "numberOfLikes"
                FROM public."LikeStatusPosts"
                WHERE "likeStatus" = 'Like' AND "isBanned" = $3
                GROUP BY "postId"
              ) lsc_like ON p.id = lsc_like."postId"
              LEFT JOIN (
                SELECT "postId", COUNT(*) AS "numberOfDislikes"
                FROM public."LikeStatusPosts"
                WHERE "likeStatus" = 'Dislike' AND "isBanned" = $3
                GROUP BY "postId"
              ) lsc_dislike ON p.id = lsc_dislike."postId"
              WHERE p."dependencyIsBanned" = $1 AND p."banInfoIsBanned" = $2
              ORDER BY "${sortBy}" ${direction}
              LIMIT $4 OFFSET $5
            ),TotalPosts AS (
              SELECT COUNT(*) AS "numberOfPosts"
              FROM public."Posts"
              WHERE "dependencyIsBanned" = $1 AND "banInfoIsBanned" = $2
            )
          SELECT
            pwl.id, pwl.title, pwl."shortDescription", pwl.content, pwl."blogId", pwl."blogName",
            pwl."createdAt", pwl."postOwnerId", pwl."dependencyIsBanned", pwl."banInfoIsBanned",
            pwl."banInfoBanDate", pwl."banInfoBanReason",
            pwl."userId", pwl."likeStatus", pwl."addedAt", pwl."login",
            pwl."likesCount"::integer,
            pwl."dislikesCount"::integer,
            tp."numberOfPosts"::integer
          FROM PostsWithLikes pwl, TotalPosts tp
        `;

    return await this.db.query(query, parameters);
  }

  private async processPostsWithLikes(
    postsWithLikes: PostsNumbersOfPostsLikesDislikesLikesStatus[],
    currentUserDto: CurrentUserDto | null,
  ): Promise<ReturnPostsEntity[]> {
    const postWithLikes: { [key: string]: ReturnPostsEntity } = {};

    postsWithLikes.forEach(
      (row: PostsNumbersOfPostsLikesDislikesLikesStatus) => {
        const postId = row.id;
        // console.log(postsWithLikes);
        if (!postWithLikes[postId]) {
          postWithLikes[postId] = {
            id: row.id,
            title: row.title,
            shortDescription: row.shortDescription,
            content: row.content,
            blogId: row.blogId,
            blogName: row.blogName,
            createdAt: row.createdAt,
            extendedLikesInfo: {
              likesCount: row.likesCount,
              dislikesCount: row.dislikesCount,
              myStatus: LikeStatusEnums.NONE,
              newestLikes: [],
            },
          };
        }

        if (currentUserDto) {
          if (row.userId === currentUserDto.id) {
            postWithLikes[postId].extendedLikesInfo.myStatus = row.likeStatus;
          }
        }

        if (row.likeStatus === LikeStatusEnums.LIKE) {
          const likeStatus = {
            addedAt: row.addedAt,
            login: row.login,
            userId: row.userId,
          };
          postWithLikes[postId].extendedLikesInfo.newestLikes.push(likeStatus);
        }
      },
    );

    return Object.values(postWithLikes);
  }
  // async findPostsByUserExist(
  //   queryData: ParseQueriesType,
  //   currentUserDto: CurrentUserDto | null,
  // ): Promise<{ posts: ReturnPostsEntity[]; numberOfPosts: number }> {
  //   try {
  //     const dependencyIsBanned = false;
  //     const banInfoIsBanned = false;
  //     const isBanned = false;
  //
  //     const sortBy = await this.getSortBy(queryData.queryPagination.sortBy);
  //     const direction = queryData.queryPagination.sortDirection;
  //     const limit = queryData.queryPagination.pageSize;
  //     const offset = (queryData.queryPagination.pageNumber - 1) * limit;
  //
  //     const query = `
  //       WITH LastThreeLikes AS (
  //         SELECT
  //           "postId", "userId", "likeStatus", "addedAt", "login",
  //           ROW_NUMBER() OVER (PARTITION BY "postId" ORDER BY "addedAt" DESC) AS rn
  //         FROM public."LikeStatusPosts"
  //         WHERE "isBanned" = $3
  //         ),
  //         PostsWithLikes AS (
  //           SELECT
  //             p.id, p.title, p."shortDescription", p.content, p."blogId", p."blogName",
  //             p."createdAt", p."postOwnerId", p."dependencyIsBanned", p."banInfoIsBanned",
  //             p."banInfoBanDate", p."banInfoBanReason",
  //             COALESCE(l."userId") AS "userId",
  //             COALESCE(l."likeStatus", 'None') AS "likeStatus",
  //             COALESCE(l."addedAt", '') AS "addedAt",
  //             COALESCE(l.login, '') AS "login",
  //             COALESCE(lsc_like."numberOfLikes", 0) AS "likesCount",
  //             COALESCE(lsc_dislike."numberOfDislikes", 0) AS "dislikesCount"
  //           FROM public."Posts" p
  //           LEFT JOIN LastThreeLikes l ON p.id = l."postId" AND l.rn <= 3
  //           LEFT JOIN (
  //             SELECT "postId", COUNT(*) AS "numberOfLikes"
  //             FROM public."LikeStatusPosts"
  //             WHERE "likeStatus" = 'Like' AND "isBanned" = $3
  //             GROUP BY "postId"
  //           ) lsc_like ON p.id = lsc_like."postId"
  //           LEFT JOIN (
  //             SELECT "postId", COUNT(*) AS "numberOfDislikes"
  //             FROM public."LikeStatusPosts"
  //             WHERE "likeStatus" = 'Dislike' AND "isBanned" = $3
  //             GROUP BY "postId"
  //           ) lsc_dislike ON p.id = lsc_dislike."postId"
  //           WHERE p."dependencyIsBanned" = $1 AND p."banInfoIsBanned" = $2
  //           ORDER BY "${sortBy}" ${direction}
  //           LIMIT $4 OFFSET $5
  //         ),TotalPosts AS (
  //           SELECT COUNT(*) AS "numberOfPosts"
  //           FROM public."Posts"
  //           WHERE "dependencyIsBanned" = $1 AND "banInfoIsBanned" = $2
  //         )
  //       SELECT
  //         pwl.id, pwl.title, pwl."shortDescription", pwl.content, pwl."blogId", pwl."blogName",
  //         pwl."createdAt", pwl."postOwnerId", pwl."dependencyIsBanned", pwl."banInfoIsBanned",
  //         pwl."banInfoBanDate", pwl."banInfoBanReason",
  //         pwl."userId", pwl."likeStatus", pwl."addedAt", pwl."login",
  //         pwl."likesCount"::integer,
  //         pwl."dislikesCount"::integer,
  //         tp."numberOfPosts"::integer
  //       FROM PostsWithLikes pwl, TotalPosts tp
  //     `;
  //
  //     const parameters = [
  //       dependencyIsBanned,
  //       banInfoIsBanned,
  //       isBanned,
  //       limit,
  //       offset,
  //     ];
  //
  //     const result = await this.db.query(query, parameters);
  //
  //     const postWithLikes: { [key: string]: ReturnPostsEntity } = {};
  //
  //     result.forEach((row: PostsNumberOfLikesDislikesLikesStatus) => {
  //       const postId = row.id;
  //
  //       if (!postWithLikes[postId]) {
  //         postWithLikes[postId] = {
  //           id: row.id,
  //           title: row.title,
  //           shortDescription: row.shortDescription,
  //           content: row.content,
  //           blogId: row.blogId,
  //           blogName: row.blogName,
  //           createdAt: row.createdAt,
  //           extendedLikesInfo: {
  //             likesCount: row.likesCount, // Update this with the actual likes count
  //             dislikesCount: row.dislikesCount, // Update this with the actual dislikes count
  //             myStatus: LikeStatusEnums.NONE, // Update this with the actual status for the current user
  //             newestLikes: [],
  //           },
  //         };
  //       }
  //       if (currentUserDto) {
  //         if (row.userId === currentUserDto.id) {
  //           postWithLikes[postId].extendedLikesInfo.myStatus = row.likeStatus; // Update the user's status for the post
  //         }
  //       }
  //       if (row.likeStatus === LikeStatusEnums.LIKE) {
  //         const likeStatus = {
  //           userId: row.userId,
  //           login: row.login,
  //           addedAt: row.addedAt,
  //         };
  //         postWithLikes[postId].extendedLikesInfo.newestLikes.push(likeStatus);
  //       }
  //     });
  //
  //     const posts: ReturnPostsEntity[] = Object.values(postWithLikes);
  //
  //     return {
  //       posts,
  //       numberOfPosts: posts.length > 0 ? result[0].numberOfPosts : 0,
  //     };
  //   } catch (error) {
  //     console.log(error.message);
  //     throw new InternalServerErrorException(error.message);
  //   }
  // }

  async openFindPosts(
    queryData: ParseQueriesType,
  ): Promise<TablesPostsEntity[]> {
    const dependencyIsBanned = false;
    const banInfoIsBanned = false;
    const sortBy = await this.getSortBy(queryData.queryPagination.sortBy);
    const direction = queryData.queryPagination.sortDirection;
    const limit = queryData.queryPagination.pageSize;
    const offset =
      (queryData.queryPagination.pageNumber - 1) *
      queryData.queryPagination.pageSize;

    try {
      return await this.db.query(
        `
        SELECT "id", "title", "shortDescription", "content", "blogId", "blogName", "createdAt",
         "postOwnerId", "dependencyIsBanned",
         "banInfoIsBanned", "banInfoBanDate", "banInfoBanReason"
        FROM public."Posts"
        WHERE "dependencyIsBanned" = $1 AND "banInfoIsBanned" = $2
        ORDER BY "${sortBy}" ${direction}
        LIMIT $3 OFFSET $4
        `,
        [dependencyIsBanned, banInfoIsBanned, limit, offset],
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findPostByPostId(postId: string): Promise<TablesPostsEntity | null> {
    try {
      const dependencyIsBanned = false;
      const banInfoIsBanned = false;
      const post = await this.db.query(
        `
      SELECT "id", "title", "shortDescription", "content", 
      "blogId", "blogName", "createdAt", 
      "postOwnerId", "dependencyIsBanned", 
      "banInfoIsBanned", "banInfoBanDate", "banInfoBanReason"
      FROM public."Posts"
      WHERE "id" = $1 AND "dependencyIsBanned" = $2 AND "banInfoIsBanned" = $3
      `,
        [postId, dependencyIsBanned, banInfoIsBanned],
      );
      // Return the first blog if found, if not found actuate catch (error)
      return post[0];
    } catch (error) {
      console.log(error.message);
      // If an error occurs, return null instead of throwing an exception
      return null;
    }
  }

  async findPostsByBlogId(
    params: BlogIdParams,
    queryData: ParseQueriesType,
  ): Promise<TablesPostsEntity[] | null> {
    const postOwnerIsBanned = false;
    const banInfoBanStatus = false;
    const { blogId } = params;
    const sortBy = await this.getSortBy(queryData.queryPagination.sortBy);
    const limit = queryData.queryPagination.pageSize;
    const direction = queryData.queryPagination.sortDirection;
    const offset =
      (queryData.queryPagination.pageNumber - 1) *
      queryData.queryPagination.pageSize;
    try {
      return await this.db.query(
        `
        SELECT "id", "title", "shortDescription", "content", "blogId", "blogName", "createdAt",
         "postOwnerId", "dependencyIsBanned",
         "banInfoIsBanned", "banInfoBanDate", "banInfoBanReason"
        FROM public."Posts"
        WHERE "blogId" = $1 AND "dependencyIsBanned" = $2 AND "banInfoIsBanned" = $3
        ORDER BY "${sortBy}" ${direction}
        LIMIT $4 OFFSET $5
        `,
        [blogId, postOwnerIsBanned, banInfoBanStatus, limit, offset],
      );
    } catch (error) {
      console.log(error.message);
      // If an error occurs, return null instead of throwing an exception
      return null;
    }
  }

  async createPost(
    postsRawSqlEntity: TablesPostsEntity,
  ): Promise<TablesPostsEntity> {
    try {
      const insertNewPost = await this.db.query(
        `
        INSERT INTO public."Posts"
            (
             "id", "title", "shortDescription", "content", "blogId", "blogName", "createdAt",
             "postOwnerId", "dependencyIsBanned",
             "banInfoIsBanned", "banInfoBanDate", "banInfoBanReason")
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          RETURNING "id", "title", "shortDescription", "content", "blogId", "blogName", "createdAt"
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
          postsRawSqlEntity.dependencyIsBanned,
          postsRawSqlEntity.banInfoIsBanned,
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

  async updatePostByPostId(
    postId: string,
    updatePostDto: UpdatePostDto,
  ): Promise<boolean> {
    try {
      const updatePost = await this.db.query(
        `
      UPDATE public."Posts"
      SET  "title" = $2, "shortDescription" = $3, "content" = $4
      WHERE "id" = $1`,
        [
          postId,
          updatePostDto.title,
          updatePostDto.shortDescription,
          updatePostDto.content,
        ],
      );
      return updatePost[1] === 1;
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async openTotalCountPosts(): Promise<number> {
    const postOwnerIsBanned = false;
    const banInfoBanStatus = false;
    try {
      const countBlogs = await this.db.query(
        `
        SELECT count(*)
        FROM public."Posts"
        WHERE "dependencyIsBanned" = $1 AND "banInfoIsBanned" = $2
      `,
        [postOwnerIsBanned, banInfoBanStatus],
      );
      return Number(countBlogs[0].count);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async totalCountPostsByBlogId(params: BlogIdParams): Promise<number> {
    const postOwnerIsBanned = false;
    const banInfoBanStatus = false;
    try {
      const countBlogs = await this.db.query(
        `
        SELECT count(*)
        FROM public."Posts"
        WHERE "blogId" = $3 AND "dependencyIsBanned" = $1 AND "banInfoIsBanned" = $2
      `,
        [postOwnerIsBanned, banInfoBanStatus, params.blogId],
      );
      return Number(countBlogs[0].count);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async changeBanStatusPostByUserId(
    userId: string,
    isBanned: boolean,
  ): Promise<boolean> {
    try {
      const updatePosts = await this.db.query(
        `
      UPDATE public."Posts"
      SET "dependencyIsBanned" = $2
      WHERE "postOwnerId" = $1`,
        [userId, isBanned],
      );
      return !!updatePosts[0];
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async changeBanStatusPostsByBlogId(
    blogId: string,
    isBanned: boolean,
  ): Promise<boolean> {
    try {
      return await this.db.query(
        `
      UPDATE public."Posts"
      SET "dependencyIsBanned" = $2
      WHERE "blogId" = $1
      `,
        [blogId, isBanned],
      );
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async changeIntoPostsBlogOwner(
    blogId: string,
    userId: string,
  ): Promise<boolean> {
    try {
      return await this.db.query(
        `
        UPDATE public."Posts"
        SET "postOwnerId" = $2
        WHERE "blogId" = $1
        `,
        [blogId, userId],
      );
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async removePostsByUserId(userId: string): Promise<boolean> {
    try {
      return await this.db.query(
        `
        DELETE FROM public."Posts"
        WHERE "postOwnerId" = $1
          `,
        [userId],
      );
    } catch (error) {
      console.log(error.message);
      throw new NotFoundException(error.message);
    }
  }

  async removePostsByBlogId(blogId: string): Promise<boolean> {
    try {
      return await this.db.query(
        `
        DELETE FROM public."Posts"
        WHERE "blogId" = $1
          `,
        [blogId],
      );
    } catch (error) {
      console.log(error.message);
      throw new NotFoundException(error.message);
    }
  }

  async removePostByPostId(postId: string): Promise<boolean> {
    try {
      const isDeleted = await this.db.query(
        `
        DELETE FROM public."Posts"
        WHERE "id" = $1
        RETURNING "id"
          `,
        [postId],
      );
      return isDeleted[1] === 1;
    } catch (error) {
      console.log(error.message);
      throw new NotFoundException(error.message);
    }
  }

  private async getSortBy(sortBy: string): Promise<string> {
    return await this.keyArrayProcessor.getKeyFromArrayOrDefault(
      sortBy,
      [
        'title',
        'shortDescription',
        'content',
        'blogName',
        'dependencyIsBanned',
        'banInfoIsBanned',
        'banInfoBanDate',
        'banInfoBanReason',
      ],
      'createdAt',
    );
  }
}

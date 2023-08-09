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
import { ReturnPostsEntity } from '../entities/return-posts-entity.entity';
import { LikeStatusEnums } from '../../../config/db/mongo/enums/like-status.enums';
import { BannedFlagsDto } from '../dto/banned-flags.dto';
import { PagingParamsDto } from '../dto/paging-params.dto';
import { ReturnPostsNumberOfPostsEntity } from '../entities/return-posts-number-of-posts.entity';
import { loginOrEmailAlreadyExists } from '../../../exception-filter/custom-errors-messages';
import { PostCountLikesDislikesStatusEntity } from '../entities/post-count-likes-dislikes-status.entity';
import { PostsCountLikesDislikesStatusEntity } from '../entities/posts-count-likes-dislikes-status.entity';

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

      const postsWithLikes: PostsCountLikesDislikesStatusEntity[] =
        await this.getPostsWithLikes(bannedFlags, pagingParams, currentUserDto);

      if (postsWithLikes.length === 0) {
        return {
          posts: [],
          numberOfPosts: 0,
        };
      }

      const posts: ReturnPostsEntity[] = await this.processPostsWithLikes(
        postsWithLikes,
        currentUserDto,
      );

      const numberOfPosts = postsWithLikes[0].numberOfPosts;
      return {
        posts,
        numberOfPosts: numberOfPosts,
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
      commentatorInfoIsBanned: false,
      dependencyIsBanned: false,
      banInfoIsBanned: false,
      isBanned: false,
    };
  }
  private async getPostWithLikes(
    postId: string,
    bannedFlags: BannedFlagsDto,
    currentUserDto: CurrentUserDto | null,
  ): Promise<PostCountLikesDislikesStatusEntity[]> {
    const { dependencyIsBanned, banInfoIsBanned, isBanned } = bannedFlags;
    const countLastLikes = 3;
    const likeStatus = 'Like';

    const parameters = [
      dependencyIsBanned,
      banInfoIsBanned,
      isBanned,
      countLastLikes,
      likeStatus,
      currentUserDto?.id,
      postId,
    ];

    const query = `
          WITH LastThreeLikes AS (
            SELECT
              "postId", "userId", "likeStatus", "addedAt", "login",
              ROW_NUMBER() OVER (PARTITION BY "postId" ORDER BY "addedAt" DESC) AS rn
            FROM public."LikeStatusPosts"
            WHERE "isBanned" = $3 AND "likeStatus" = $5
          ),
          PostsWithLikes AS (
    SELECT
      p.id, p.title, p."shortDescription", p.content, p."blogId", p."blogName",
      p."createdAt", p."postOwnerId", p."dependencyIsBanned", p."banInfoIsBanned",
      p."banInfoBanDate", p."banInfoBanReason",
      COALESCE(CAST(l."userId" AS text), '0') AS "userId",
      COALESCE(l."likeStatus", 'None') AS "likeStatus",
      COALESCE(l."addedAt" ) AS "addedAt",
      COALESCE(l.login ) AS "login",
      COALESCE(lsc_myStatus."likeStatus", 'None') AS "myStatus",
      COALESCE(lsc_like."likesCount", 0) AS "likesCount",
      COALESCE(lsc_dislike."dislikesCount", 0) AS "dislikesCount"
      FROM public."Posts" p
      LEFT JOIN LastThreeLikes l ON p.id = l."postId" AND l.rn <= $4
      LEFT JOIN (
        SELECT "postId", COUNT(*) AS "likesCount"
        FROM public."LikeStatusPosts"
        WHERE "likeStatus" = 'Like' AND "isBanned" = $3
        GROUP BY "postId"
      ) lsc_like ON p.id = lsc_like."postId"
      LEFT JOIN (
        SELECT "postId", COUNT(*) AS "dislikesCount"
        FROM public."LikeStatusPosts"
        WHERE "likeStatus" = 'Dislike' AND "isBanned" = $3
        GROUP BY "postId"
      ) lsc_dislike ON p.id = lsc_dislike."postId"
      LEFT JOIN (
        SELECT "postId", "likeStatus"
        FROM public."LikeStatusPosts"
        WHERE "userId" = $6 AND "isBanned" = $3
      ) lsc_myStatus ON p.id = lsc_myStatus."postId"
      WHERE p."dependencyIsBanned" = $1 AND p."banInfoIsBanned" = $2 AND p.id = $7
    )
    SELECT
      pwl."id", pwl."title", pwl."shortDescription", pwl."content", pwl."blogId", pwl."blogName", pwl."createdAt",
      pwl."postOwnerId", pwl."dependencyIsBanned", pwl."banInfoIsBanned", pwl."banInfoBanDate", pwl."banInfoBanReason",
      pwl."likesCount"::integer,
      pwl."dislikesCount"::integer,
      pwl."myStatus",
      pwl."userId", 
      pwl."addedAt",
      pwl."login",
      pwl."likeStatus"
    FROM PostsWithLikes pwl
  `;

    try {
      return await this.db.query(query, parameters);
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  private async getPostsWithLikes(
    bannedFlags: BannedFlagsDto,
    pagingParams: PagingParamsDto,
    currentUserDto: CurrentUserDto | null,
  ): Promise<PostsCountLikesDislikesStatusEntity[]> {
    const { dependencyIsBanned, banInfoIsBanned, isBanned } = bannedFlags;
    const { sortBy, direction, limit, offset } = pagingParams;
    const countLastLikes = 3;
    const likeStatus = 'Like';

    const parameters = [
      dependencyIsBanned,
      banInfoIsBanned,
      isBanned,
      countLastLikes,
      likeStatus,
      currentUserDto?.id,
      limit,
      offset,
    ];

    const query = `
      WITH LastThreeLikes AS (
        SELECT
          "postId", "userId", "likeStatus", "addedAt", "login",
          ROW_NUMBER() OVER (PARTITION BY "postId" ORDER BY "addedAt" DESC) AS rn
        FROM public."LikeStatusPosts"
        WHERE "isBanned" = $3 AND "likeStatus" = $5
        ),
        PostsWithLikes AS (
          SELECT
            p.id, p.title, p."shortDescription", p.content, p."blogId", p."blogName",
            p."createdAt", p."postOwnerId", p."dependencyIsBanned", p."banInfoIsBanned",
            p."banInfoBanDate", p."banInfoBanReason",
            COALESCE(CAST(l."userId" AS text), '0') AS "userId",
            COALESCE(l."likeStatus", 'None') AS "likeStatus",
            COALESCE(l."addedAt" ) AS "addedAt",
            COALESCE(l.login ) AS "login",
            COALESCE(lsc_myStatus."likeStatus", 'None') AS "myStatus",
            COALESCE(lsc_like."likesCount", 0) AS "likesCount",
            COALESCE(lsc_dislike."dislikesCount", 0) AS "dislikesCount"
          FROM public."Posts" p
          LEFT JOIN LastThreeLikes l ON p.id = l."postId" AND l.rn <= $4
          LEFT JOIN (
            SELECT "postId", COUNT(*) AS "likesCount"
            FROM public."LikeStatusPosts"
            WHERE "likeStatus" = 'Like' AND "isBanned" = $3
            GROUP BY "postId"
          ) lsc_like ON p.id = lsc_like."postId"
          LEFT JOIN (
            SELECT "postId", COUNT(*) AS "dislikesCount"
            FROM public."LikeStatusPosts"
            WHERE "likeStatus" = 'Dislike' AND "isBanned" = $3
            GROUP BY "postId"
          ) lsc_dislike ON p.id = lsc_dislike."postId"
          LEFT JOIN (
            SELECT "postId", "likeStatus"
            FROM public."LikeStatusPosts"
            WHERE "userId" = $6 AND "isBanned" = $3
          ) lsc_myStatus ON p.id = lsc_myStatus."postId"
          WHERE p."dependencyIsBanned" = $1 AND p."banInfoIsBanned" = $2
          ORDER BY "${sortBy}" ${direction}
          LIMIT $7 OFFSET $8
        ),TotalPosts AS (
          SELECT COUNT(*) AS "numberOfPosts"
          FROM public."Posts"
          WHERE "dependencyIsBanned" = $1 AND "banInfoIsBanned" = $2
        )
        SELECT
          pwl."id", pwl."title", pwl."shortDescription", pwl."content", pwl."blogId", pwl."blogName", pwl."createdAt",
          pwl."postOwnerId", pwl."dependencyIsBanned", pwl."banInfoIsBanned", pwl."banInfoBanDate", pwl."banInfoBanReason",
          pwl."likesCount"::integer,
          pwl."dislikesCount"::integer,
          pwl."myStatus",
          pwl."userId", 
          pwl."addedAt",
          pwl."login",
          pwl."likeStatus",
          tp."numberOfPosts"::integer
        FROM PostsWithLikes pwl, TotalPosts tp
        `;

    try {
      return await this.db.query(query, parameters);
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async findPostByPostIdWithLikes(
    postId: string,
    queryData: ParseQueriesType,
    currentUserDto: CurrentUserDto | null,
  ): Promise<ReturnPostsEntity | null> {
    const bannedFlags: BannedFlagsDto = await this.getBannedFlags();

    try {
      const postWithLikes: PostCountLikesDislikesStatusEntity[] =
        await this.getPostWithLikes(postId, bannedFlags, currentUserDto);

      if (postWithLikes && postWithLikes.length < 0) {
        return null;
      }

      const post: ReturnPostsEntity[] = await this.processPostWithLikes(
        postWithLikes,
      );

      return post[0];
    } catch (error) {
      console.log(error.message);
      if (error.message.includes('invalid input syntax for type uuid:')) {
        loginOrEmailAlreadyExists.field = error.message.match(/"(.*?)"/)[1];
        throw new NotFoundException('Not found post.');
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async getPostById(postId: string): Promise<TablesPostsEntity | null> {
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
  ): Promise<TablesPostsEntity[]> {
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
      const parameters = [
        blogId,
        postOwnerIsBanned,
        banInfoBanStatus,
        limit,
        offset,
      ];

      const query = `
       SELECT "id", "title", "shortDescription", "content", "blogId", "blogName", "createdAt",
       "postOwnerId", "dependencyIsBanned",
       "banInfoIsBanned", "banInfoBanDate", "banInfoBanReason"
        FROM public."Posts"
        LEFT JOIN (
            SELECT 1 AS empty
            WHERE NOT EXISTS (
                SELECT 1
                FROM public."Posts"
                WHERE "blogId" = $1 AND "dependencyIsBanned" = $2 AND "banInfoIsBanned" = $3
            )
        ) AS empty_check ON empty_check.empty = 1
        WHERE "blogId" = $1 AND "dependencyIsBanned" = $2 AND "banInfoIsBanned" = $3
        ORDER BY "${sortBy}" ${direction}
        LIMIT $4 OFFSET $5
        `;

      return await this.db.query(query, parameters);
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
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
    const dependencyIsBanned = false;
    const banInfoIsBanned = false;
    try {
      const countBlogs = await this.db.query(
        `
        SELECT count(*)
        FROM public."Posts"
        WHERE "blogId" = $1 AND "dependencyIsBanned" = $2 AND "banInfoIsBanned" = $3
      `,
        [params.blogId, dependencyIsBanned, banInfoIsBanned],
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

  private async processPostsWithLikes(
    postsWithLikes: PostsCountLikesDislikesStatusEntity[],
    currentUserDto: CurrentUserDto | null,
  ): Promise<ReturnPostsEntity[]> {
    const postWithLikes: { [key: string]: ReturnPostsEntity } = {};

    postsWithLikes.forEach((row: PostsCountLikesDislikesStatusEntity) => {
      const postId = row.id;

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
        postWithLikes[postId].extendedLikesInfo.myStatus = row.myStatus;
      }

      if (row.likeStatus === LikeStatusEnums.LIKE) {
        const likeStatus = {
          addedAt: row.addedAt,
          userId: row.userId,
          login: row.login,
        };
        postWithLikes[postId].extendedLikesInfo.newestLikes.push(likeStatus);
      }
    });

    return Object.values(postWithLikes);
  }

  private async processPostWithLikes(
    post: PostCountLikesDislikesStatusEntity[],
  ): Promise<ReturnPostsEntity[]> {
    const postWithLikes: { [key: string]: ReturnPostsEntity } = {};

    post.forEach((row: PostCountLikesDislikesStatusEntity) => {
      const postId = row.id;

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
            myStatus: row.myStatus,
            newestLikes: [],
          },
        };
      }

      if (row.likeStatus === LikeStatusEnums.LIKE) {
        const likeStatus = {
          addedAt: row.addedAt,
          login: row.login,
          userId: row.userId,
        };
        postWithLikes[postId].extendedLikesInfo.newestLikes.push(likeStatus);
      }
    });

    return Object.values(postWithLikes);
  }
}

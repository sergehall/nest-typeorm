import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';
import { UpdatePostDto } from '../dto/update-post.dto';
import { TablesPostsEntity } from '../entities/tables-posts-entity';
import { CurrentUserDto } from '../../users/dto/currentUser.dto';
import { ReturnPostsEntity } from '../entities/return-posts-entity.entity';
import { LikeStatusEnums } from '../../../config/db/mongo/enums/like-status.enums';
import { BannedFlagsDto } from '../dto/banned-flags.dto';
import { ReturnPostsCountPostsEntity } from '../entities/return-posts-count-posts.entity';
import { PostCountLikesDislikesStatusEntity } from '../entities/post-count-likes-dislikes-status.entity';
import { PostsCountPostsLikesDislikesStatusEntity } from '../entities/posts-count-posts-likes-dislikes-status.entity';
import { KeyResolver } from '../../../common/helpers/key-resolver';
import {
  ParseQueriesDto,
  SortDirection,
} from '../../../common/query/dto/parse-queries.dto';
import { PagingParamsDto } from '../../../common/pagination/dto/paging-params.dto';

export class PostsRawSqlRepository {
  constructor(
    @InjectDataSource() private readonly db: DataSource,
    protected keyResolver: KeyResolver,
  ) {}
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

  async findPostByPostIdWithLikes(
    postId: string,
    currentUserDto: CurrentUserDto | null,
  ): Promise<ReturnPostsEntity> {
    const bannedFlags: BannedFlagsDto = await this.getBannedFlags();

    try {
      const postWithLikes: PostCountLikesDislikesStatusEntity[] =
        await this.getPostWithLikesByPostId(
          postId,
          bannedFlags,
          currentUserDto,
        );

      const post: ReturnPostsEntity[] = await this.processPostWithLikes(
        postWithLikes,
      );

      return post[0];
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async findPostsAndTotalCountPosts(
    queryData: ParseQueriesDto,
    currentUserDto: CurrentUserDto | null,
  ): Promise<ReturnPostsCountPostsEntity> {
    try {
      const bannedFlags: BannedFlagsDto = await this.getBannedFlags();

      const pagingParams: PagingParamsDto = await this.getPagingParams(
        queryData,
      );

      const postsWithLikes: PostsCountPostsLikesDislikesStatusEntity[] =
        await this.getPostsWithLikes(bannedFlags, pagingParams, currentUserDto);

      if (postsWithLikes.length === 0) {
        return {
          posts: [],
          countPosts: 0,
        };
      }

      const posts: ReturnPostsEntity[] = await this.processPostsWithLikes(
        postsWithLikes,
        currentUserDto,
      );

      return {
        posts,
        countPosts: postsWithLikes[0].countPosts,
      };
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async findPostsAndTotalCountPostsForBlog(
    blogId: string,
    queryData: ParseQueriesDto,
    currentUserDto: CurrentUserDto | null,
  ): Promise<ReturnPostsCountPostsEntity> {
    try {
      const bannedFlags: BannedFlagsDto = await this.getBannedFlags();

      const pagingParams: PagingParamsDto = await this.getPagingParams(
        queryData,
      );

      const postsWithLikes: PostsCountPostsLikesDislikesStatusEntity[] =
        await this.getPostsWithLikesForBlog(
          blogId,
          bannedFlags,
          pagingParams,
          currentUserDto,
        );

      if (postsWithLikes.length === 0) {
        return {
          posts: [],
          countPosts: 0,
        };
      }

      const posts: ReturnPostsEntity[] = await this.processPostsWithLikes(
        postsWithLikes,
        currentUserDto,
      );

      return {
        posts,
        countPosts: postsWithLikes[0].countPosts,
      };
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

  async deletePostByPostId(postId: string): Promise<boolean> {
    try {
      await this.db.transaction(async (client) => {
        await client.query(
          `
        DELETE FROM public."LikeStatusPosts"
        WHERE "postId" = $1
        `,
          [postId],
        );

        await client.query(
          `
        DELETE FROM public."Comments"
        WHERE "postInfoPostId" = $1
        `,
          [postId],
        );

        const result = await client.query(
          `
        DELETE FROM public."Posts"
        WHERE "id" = $1
        RETURNING "id"
        `,
          [postId],
        );
        if (result[0][0].id) {
          console.log(`Post with ID ${result[0][0].id} deleted.`);
        }
      });
      return true;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  private async getSortBy(sortBy: string): Promise<string> {
    return await this.keyResolver.resolveKey(
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

  private async getBannedFlags(): Promise<BannedFlagsDto> {
    return {
      commentatorInfoIsBanned: false,
      dependencyIsBanned: false,
      banInfoIsBanned: false,
      isBanned: false,
    };
  }

  private async getPagingParams(
    queryData: ParseQueriesDto,
  ): Promise<PagingParamsDto> {
    const sortBy: string = await this.getSortBy(
      queryData.queryPagination.sortBy,
    );
    const direction: SortDirection = queryData.queryPagination.sortDirection;
    const limit: number = queryData.queryPagination.pageSize;
    const offset: number = (queryData.queryPagination.pageNumber - 1) * limit;

    return { sortBy, direction, limit, offset };
  }

  private async getPostWithLikesByPostId(
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
      throw new InternalServerErrorException(error.message);
    }
  }

  private async getPostsWithLikesForBlog(
    blogId: string,
    bannedFlags: BannedFlagsDto,
    pagingParams: PagingParamsDto,
    currentUserDto: CurrentUserDto | null,
  ): Promise<PostsCountPostsLikesDislikesStatusEntity[]> {
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
      blogId,
    ];

    const query = `
      WITH LastThreeLikes AS (
        SELECT
          "postId", "userId", "likeStatus", "addedAt", "login",
          ROW_NUMBER() OVER (PARTITION BY "postId" ORDER BY "addedAt" DESC) AS rn
        FROM public."LikeStatusPosts"
        WHERE "isBanned" = $3 AND "likeStatus" = $5 AND "blogId" = $9
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
            WHERE "likeStatus" = 'Like' AND "isBanned" = $3 AND "blogId" = $9
            GROUP BY "postId"
          ) lsc_like ON p.id = lsc_like."postId"
          LEFT JOIN (
            SELECT "postId", COUNT(*) AS "dislikesCount"
            FROM public."LikeStatusPosts"
            WHERE "likeStatus" = 'Dislike' AND "isBanned" = $3 AND "blogId" = $9
            GROUP BY "postId"
          ) lsc_dislike ON p.id = lsc_dislike."postId"
          LEFT JOIN (
            SELECT "postId", "likeStatus"
            FROM public."LikeStatusPosts"
            WHERE "userId" = $6 AND "isBanned" = $3
          ) lsc_myStatus ON p.id = lsc_myStatus."postId"
          WHERE p."dependencyIsBanned" = $1 AND p."banInfoIsBanned" = $2 AND "blogId" = $9
          ORDER BY "${sortBy}" ${direction}
          LIMIT $7 OFFSET $8
        ),TotalPosts AS (
          SELECT COUNT(*) AS "countPosts"
          FROM public."Posts"
          WHERE "dependencyIsBanned" = $1 AND "banInfoIsBanned" = $2 AND "blogId" = $9
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
          tp."countPosts"::integer
        FROM PostsWithLikes pwl, TotalPosts tp
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
  ): Promise<PostsCountPostsLikesDislikesStatusEntity[]> {
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
          SELECT COUNT(*) AS "countPosts"
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
          tp."countPosts"::integer
        FROM PostsWithLikes pwl, TotalPosts tp
        `;

    try {
      return await this.db.query(query, parameters);
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  private async processPostsWithLikes(
    postsWithLikes: PostsCountPostsLikesDislikesStatusEntity[],
    currentUserDto: CurrentUserDto | null,
  ): Promise<ReturnPostsEntity[]> {
    const postWithLikes: { [key: string]: ReturnPostsEntity } = {};

    postsWithLikes.forEach((row: PostsCountPostsLikesDislikesStatusEntity) => {
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

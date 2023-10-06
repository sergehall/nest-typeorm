import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';
import { UpdatePostDto } from '../dto/update-post.dto';
import { TablesPostsEntity } from '../entities/tables-posts-entity';
import { CurrentUserDto } from '../../users/dto/currentUser.dto';
import {
  ExtendedLikesInfo,
  ReturnPostsEntity,
} from '../entities/return-posts.entity';
import { LikeStatusEnums } from '../../../config/db/mongo/enums/like-status.enums';
import { BannedFlagsDto } from '../dto/banned-flags.dto';
import { PostCountLikesDislikesStatusEntity } from '../entities/post-count-likes-dislikes-status.entity';
import { PostsCountPostsLikesDislikesStatusEntity } from '../entities/posts-count-posts-likes-dislikes-status.entity';
import { KeyResolver } from '../../../common/helpers/key-resolver';
import { ParseQueriesDto } from '../../../common/query/dto/parse-queries.dto';
import { PagingParamsDto } from '../../../common/pagination/dto/paging-params.dto';
import { TableBloggerBlogsRawSqlEntity } from '../../blogger-blogs/entities/table-blogger-blogs-raw-sql.entity';
import { CreatePostDto } from '../dto/create-post.dto';
import * as uuid4 from 'uuid4';
import { PartialPostsEntity } from '../dto/return-posts-entity.dto';
import { PostsAndCountDto } from '../dto/posts-and-count.dto';
import { SortDirectionEnum } from '../../../common/query/enums/sort-direction.enum';

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
  async findPostsAndTotalCountPostsForBlog(
    blogId: string,
    queryData: ParseQueriesDto,
    currentUserDto: CurrentUserDto | null,
  ): Promise<PostsAndCountDto> {
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
    blog: TableBloggerBlogsRawSqlEntity,
    createPostDto: CreatePostDto,
    currentUserDto: CurrentUserDto,
  ): Promise<ReturnPostsEntity> {
    const postEntity: TablesPostsEntity = await this.getTablesPostsEntity(
      blog,
      createPostDto,
      currentUserDto,
    );

    const query = `
        INSERT INTO public."Posts"
            (
             "id", "title", "shortDescription", "content", "blogId", "blogName", "createdAt",
             "postOwnerId", "dependencyIsBanned",
             "banInfoIsBanned", "banInfoBanDate", "banInfoBanReason")
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          RETURNING "id", "title", "shortDescription", "content", "blogId", "blogName", "createdAt"
          `;

    const parameters = [
      postEntity.id,
      postEntity.title,
      postEntity.shortDescription,
      postEntity.content,
      postEntity.blogId,
      postEntity.blogName,
      postEntity.createdAt,
      postEntity.postOwnerId,
      postEntity.dependencyIsBanned,
      postEntity.banInfoIsBanned,
      postEntity.banInfoBanDate,
      postEntity.banInfoBanReason,
    ];

    try {
      const insertPost: PartialPostsEntity[] = await this.db.query(
        query,
        parameters,
      );

      return await this.addExtendedLikesInfoToPostsEntity(insertPost[0]);
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
    const direction: SortDirectionEnum =
      queryData.queryPagination.sortDirection;
    const limit: number = queryData.queryPagination.pageSize;
    const offset: number = (queryData.queryPagination.pageNumber - 1) * limit;

    return { sortBy, direction, limit, offset };
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
      currentUserDto?.userId,
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

  private async processPostsWithLikes(
    postsWithLikes: PostsCountPostsLikesDislikesStatusEntity[],
    currentUserDto: CurrentUserDto | null,
  ): Promise<ReturnPostsEntity[]> {
    const postWithLikes: { [key: string]: ReturnPostsEntity } = {};

    return postsWithLikes.reduce<ReturnPostsEntity[]>((result, row) => {
      const postId = row.id;

      let postEntity = postWithLikes[postId];
      if (!postEntity) {
        postEntity = {
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
            myStatus: currentUserDto ? row.myStatus : LikeStatusEnums.NONE,
            newestLikes: [],
          },
        };
        postWithLikes[postId] = postEntity;
        result.push(postEntity);
      }

      if (row.likeStatus === LikeStatusEnums.LIKE) {
        postEntity.extendedLikesInfo.newestLikes.push({
          addedAt: row.addedAt,
          userId: row.userId,
          login: row.login,
        });
      }

      return result;
    }, []);
  }

  private async processPostWithLikes(
    post: PostCountLikesDislikesStatusEntity[],
  ): Promise<ReturnPostsEntity[]> {
    const postWithLikes: { [key: string]: ReturnPostsEntity } = {};

    return post.reduce<ReturnPostsEntity[]>((result, row) => {
      const postId = row.id;

      let postEntity = postWithLikes[postId];
      if (!postEntity) {
        postEntity = {
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
        postWithLikes[postId] = postEntity;
        result.push(postEntity);
      }

      if (row.likeStatus === LikeStatusEnums.LIKE) {
        postEntity.extendedLikesInfo.newestLikes.push({
          addedAt: row.addedAt,
          login: row.login,
          userId: row.userId,
        });
      }

      return result;
    }, []);
  }

  private async getTablesPostsEntity(
    blog: TableBloggerBlogsRawSqlEntity,
    createPostDto: CreatePostDto,
    currentUserDto: CurrentUserDto,
  ): Promise<TablesPostsEntity> {
    return {
      id: uuid4().toString(),
      title: createPostDto.title,
      shortDescription: createPostDto.shortDescription,
      content: createPostDto.content,
      blogId: blog.id,
      blogName: blog.name,
      createdAt: new Date().toISOString(),
      postOwnerId: currentUserDto.userId,
      dependencyIsBanned: false,
      banInfoIsBanned: false,
      banInfoBanDate: null,
      banInfoBanReason: null,
    };
  }

  private async addExtendedLikesInfoToPostsEntity(
    newPost: PartialPostsEntity,
  ): Promise<ReturnPostsEntity> {
    const extendedLikesInfo = new ExtendedLikesInfo();
    return {
      ...newPost, // Spread properties of newPost
      extendedLikesInfo, // Add extendedLikesInfo property
    };
  }
}

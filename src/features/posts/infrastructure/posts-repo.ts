import { InjectRepository } from '@nestjs/typeorm';
import { InsertResult, Repository } from 'typeorm';
import { PostsEntity } from '../entities/posts.entity';
import { CurrentUserDto } from '../../users/dto/currentUser.dto';
import { BloggerBlogsEntity } from '../../blogger-blogs/entities/blogger-blogs.entity';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from '../dto/create-post.dto';
import * as uuid4 from 'uuid4';
import { UsersEntity } from '../../users/entities/users.entity';
import { PartialPostsEntity } from '../dto/return-posts-entity.dto';
import {
  ExtendedLikesInfo,
  ReturnPostsEntity,
} from '../entities/return-posts.entity';
import { PostsCountPostsLikesDislikesStatusEntity } from '../entities/posts-count-posts-likes-dislikes-status.entity';
import { BannedFlagsDto } from '../dto/banned-flags.dto';
import { PagingParamsDto } from '../../../common/pagination/dto/paging-params.dto';
import {
  ParseQueriesDto,
  SortDirection,
} from '../../../common/query/dto/parse-queries.dto';
import { LikeStatusPostsEntity } from '../entities/like-status-posts.entity';
import { KeyResolver } from '../../../common/helpers/key-resolver';
import { PostsCountPostsDto } from '../dto/posts-count-posts.dto';
import { LikeStatusEnums } from '../../../config/db/mongo/enums/like-status.enums';

export class PostsRepo {
  constructor(
    protected keyResolver: KeyResolver,
    @InjectRepository(PostsEntity)
    private readonly postsRepository: Repository<PostsEntity>,
    @InjectRepository(LikeStatusPostsEntity)
    private readonly likePostsRepository: Repository<LikeStatusPostsEntity>,
  ) {}

  async findPostById(id: string): Promise<PostsEntity | null> {
    try {
      const post = await this.postsRepository.findBy({ id });
      return post[0] ? post[0] : null;
    } catch (error) {
      if (await this.isInvalidUUIDError(error)) {
        const userId = await this.extractUserIdFromError(error);
        throw new NotFoundException(`Post with ID ${userId} not found`);
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async createPosts(
    blog: BloggerBlogsEntity,
    createPostDto: CreatePostDto,
    currentUserDto: CurrentUserDto,
  ): Promise<ReturnPostsEntity> {
    const postEntity: PostsEntity = await this.creatPostsEntity(
      blog,
      createPostDto,
      currentUserDto,
    );

    try {
      const queryBuilder = this.postsRepository
        .createQueryBuilder()
        .insert()
        .into(PostsEntity)
        .values(postEntity)
        .returning(
          `"id", "title", "shortDescription", "content", "blogId", "blogName", "createdAt"`,
        );

      const result: InsertResult = await queryBuilder.execute();

      return await this.addExtendedLikesInfoToPostsEntity(result.raw[0]);
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(
        'An error occurred while creating a new post.',
      );
    }
  }

  async getPostsAndLikesWithPagination(
    blogId: string,
    queryData: ParseQueriesDto,
    currentUserDto: CurrentUserDto | null,
  ): Promise<any> {
    const bannedFlags: BannedFlagsDto = await this.getBannedFlags();

    const pagingParams: PagingParamsDto = await this.getPagingParams(queryData);
    const { dependencyIsBanned, isBanned } = bannedFlags;
    const { sortBy, direction, limit, offset } = pagingParams;
    const numberLastLikes = 3;
    const likeStatus = 'Like';

    // Query posts with pagination conditions
    const [posts, totalPosts] = await this.postsRepository.findAndCount({
      where: {
        dependencyIsBanned,
        isBanned,
        blog: { id: blogId },
      },
      order: { [sortBy]: direction },
      take: limit,
      skip: offset,
    });

    // Fetch last three likes for each post
    const postsWithLikesAndStatus = await Promise.all(
      posts.map(async (post) => {
        let status = 'None';
        if (currentUserDto) {
          const userLike = await this.likePostsRepository.findOne({
            where: {
              post: { id: post.id },
              ratedPostUser: { userId: currentUserDto.userId },
            },
          });
          if (userLike) {
            status = userLike.likeStatus;
          }
        }

        const postLikes = await this.likePostsRepository.find({
          where: {
            post: { id: post.id },
            likeStatus: likeStatus,
          },
          order: { addedAt: 'DESC' },
          take: numberLastLikes,
        });

        return {
          ...post,
          lastLikes: postLikes,
          myStatus: status,
        };
      }),
    );

    console.log(postsWithLikesAndStatus);
    return {
      posts: postsWithLikesAndStatus,
      totalPosts,
    };
  }

  async findPostsAndTotalCountPostsForBlog(
    blogId: string,
    queryData: ParseQueriesDto,
    currentUserDto: CurrentUserDto | null,
  ): Promise<PostsCountPostsDto> {
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

    const lastThreeLikesSubQuery = this.likePostsRepository
      .createQueryBuilder('LikeStatusPosts')
      .select(['postId', 'userId', 'likeStatus', 'addedAt', 'login'])
      .addSelect(
        'ROW_NUMBER() OVER (PARTITION BY "postId" ORDER BY "addedAt" DESC)',
        'rn',
      )
      .where('"isBanned" = :isBanned', { isBanned })
      .andWhere('"likeStatus" = :likeStatus', { likeStatus })
      .andWhere('"blogId" = :blogId', { blogId })
      .andWhere('rn <= :countLastLikes', { countLastLikes })
      .getQuery();

    const postsWithLikesQuery = this.postsRepository
      .createQueryBuilder('Posts')
      .select([
        'p.id',
        'p.title',
        'p.shortDescription',
        'p.content',
        'p.blogId',
        'p.blogName',
        'p.createdAt',
        'p.postOwnerId',
        'p.dependencyIsBanned',
        'p.banInfoIsBanned',
        'p.banInfoBanDate',
        'p.banInfoBanReason',
        `COALESCE(CAST(l."userId" AS text), '0')`,
        'userId',
        `COALESCE(l."likeStatus", 'None')`,
        'likeStatus',
        `COALESCE(l."addedAt")`,
        'addedAt',
        `COALESCE(l.login)`,
        'login',
        `COALESCE(lsc_myStatus."likeStatus", 'None')`,
        'myStatus',
        `COALESCE(lsc_like."likesCount", 0)`,
        'likesCount',
        `COALESCE(lsc_dislike."dislikesCount", 0)`,
        'dislikesCount',
      ])
      .leftJoin(`(${lastThreeLikesSubQuery})`, 'l', 'Posts.id = l."postId"')
      .leftJoin(
        (q) =>
          q
            .select(['"postId"', 'COUNT(*) AS "likesCount"'])
            .from(LikeStatusPostsEntity, 'LikeStatusPosts')
            .where('"likeStatus" = :likeStatus', { likeStatus })
            .andWhere('"isBanned" = :isBanned', { isBanned })
            .andWhere('"blogId" = :blogId', { blogId })
            .groupBy('"postId"'),
        'lsc_like',
        'Posts.id = lsc_like."postId"',
      )
      .leftJoin(
        (q) =>
          q
            .select(['"postId"', 'COUNT(*) AS "dislikesCount"'])
            .from(LikeStatusPostsEntity, 'LikeStatusPosts')
            .where('"likeStatus" = :dislikeStatus', {
              dislikeStatus: 'Dislike',
            })
            .andWhere('"isBanned" = :isBanned', { isBanned })
            .andWhere('"blogId" = :blogId', { blogId })
            .groupBy('"postId"'),
        'lsc_dislike',
        'Posts.id = lsc_dislike."postId"',
      )
      .leftJoin(
        (q) =>
          q
            .select(['"postId"', '"likeStatus"'])
            .from(LikeStatusPostsEntity, 'LikeStatusPosts')
            .where('"userId" = :userId', { userId: currentUserDto?.userId })
            .andWhere('"isBanned" = :isBanned', { isBanned }),
        'lsc_myStatus',
        'Posts.id = lsc_myStatus."postId"',
      )
      .where('Posts."dependencyIsBanned" = :dependencyIsBanned', {
        dependencyIsBanned,
      })
      .andWhere('Posts."banInfoIsBanned" = :banInfoIsBanned', {
        banInfoIsBanned,
      })
      .andWhere('"blogId" = :blogId', { blogId })
      .orderBy(`"Posts"."${sortBy}"`, direction)
      .limit(limit)
      .offset(offset)
      .getQuery();

    const totalPostsQuery = this.postsRepository
      .createQueryBuilder('Posts')
      .select('COUNT(*)', 'countPosts')
      .where('Posts."dependencyIsBanned" = :dependencyIsBanned', {
        dependencyIsBanned,
      })
      .andWhere('Posts."banInfoIsBanned" = :banInfoIsBanned', {
        banInfoIsBanned,
      })
      .andWhere('"blogId" = :blogId', { blogId })
      .getQuery();

    const query = `
      WITH LastThreeLikes AS (${lastThreeLikesSubQuery}),
      PostsWithLikes AS (${postsWithLikesQuery}),
      TotalPosts AS (${totalPostsQuery})
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
      return await this.postsRepository.query(query);
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  private async creatPostsEntity(
    blog: BloggerBlogsEntity,
    createPostDto: CreatePostDto,
    currentUserDto: CurrentUserDto,
  ): Promise<PostsEntity> {
    const { title, shortDescription, content } = createPostDto;

    const user = new UsersEntity();
    user.userId = currentUserDto.userId;

    const postEntity = new PostsEntity();
    postEntity.id = uuid4().toString();
    postEntity.title = title;
    postEntity.shortDescription = shortDescription;
    postEntity.content = content;
    postEntity.createdAt = new Date().toISOString();
    postEntity.dependencyIsBanned = false;
    postEntity.isBanned = false;
    postEntity.banDate = null;
    postEntity.banReason = null;
    postEntity.blog = blog;
    postEntity.postOwner = user;

    return postEntity;
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

  private async addExtendedLikesInfoToPostsEntity(
    newPost: PartialPostsEntity,
  ): Promise<ReturnPostsEntity> {
    const extendedLikesInfo = new ExtendedLikesInfo();
    return {
      ...newPost, // Spread properties of newPost
      extendedLikesInfo, // Add extendedLikesInfo property
    };
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

  private async isInvalidUUIDError(error: any): Promise<boolean> {
    return error.message.includes('invalid input syntax for type uuid');
  }

  private async extractUserIdFromError(error: any): Promise<string | null> {
    const match = error.message.match(/"([^"]+)"/);
    return match ? match[1] : null;
  }
}

import { InjectRepository } from '@nestjs/typeorm';
import { InsertResult, Repository } from 'typeorm';
import { PostsEntity } from '../entities/posts.entity';
import { CurrentUserDto } from '../../users/dto/current-user.dto';
import { BloggerBlogsEntity } from '../../blogger-blogs/entities/blogger-blogs.entity';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from '../dto/create-post.dto';
import {
  ExtendedLikesInfo,
  NewestLikes,
  PostWithLikesInfoViewModel,
} from '../view-models/post-with-likes-info.view-model';
import { BannedFlagsDto } from '../dto/banned-flags.dto';
import { ParseQueriesDto } from '../../../common/query/dto/parse-queries.dto';
import { LikeStatusPostsEntity } from '../entities/like-status-posts.entity';
import { KeyResolver } from '../../../common/helpers/key-resolver';
import { PostsAndCountDto } from '../dto/posts-and-count.dto';
import { CommentsEntity } from '../../comments/entities/comments.entity';
import { UpdatePostDto } from '../dto/update-post.dto';
import { LikeStatusCommentsEntity } from '../../comments/entities/like-status-comments.entity';
import { LikesDislikesMyStatusInfoDto } from '../../comments/dto/likes-dislikes-my-status-info.dto';
import { SortDirectionEnum } from '../../../common/query/enums/sort-direction.enum';
import { UuidErrorResolver } from '../../../common/helpers/uuid-error-resolver';
import { LikeStatusEnums } from '../../../db/enums/like-status.enums';
import { PostViewModel } from '../view-models/post.view-model';

export class PostsRepo {
  constructor(
    protected keyResolver: KeyResolver,
    @InjectRepository(PostsEntity)
    private readonly postsRepository: Repository<PostsEntity>,
    @InjectRepository(LikeStatusPostsEntity)
    private readonly likePostsRepository: Repository<LikeStatusPostsEntity>,
    @InjectRepository(CommentsEntity)
    private readonly commentsRepository: Repository<CommentsEntity>,
    protected uuidErrorResolver: UuidErrorResolver,
  ) {}

  async getPostByIdWithoutLikes(id: string): Promise<PostsEntity | null> {
    try {
      const bannedFlags: BannedFlagsDto = await this.getBannedFlags();
      const { dependencyIsBanned, isBanned } = bannedFlags;

      const post = await this.postsRepository.findBy({
        id,
        dependencyIsBanned,
        isBanned,
      });

      return post[0] ? post[0] : null;
    } catch (error) {
      if (await this.uuidErrorResolver.isInvalidUUIDError(error)) {
        const userId = await this.uuidErrorResolver.extractUserIdFromError(
          error,
        );
        throw new NotFoundException(`Post with ID ${userId} not found`);
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async getPostByIdWithLikes(
    id: string,
    currentUserDto: CurrentUserDto | null,
  ): Promise<PostWithLikesInfoViewModel[] | null> {
    // Retrieve banned flags
    const bannedFlags: BannedFlagsDto = await this.getBannedFlags();
    const { dependencyIsBanned, isBanned } = bannedFlags;
    const numberLastLikes = await this.numberLastLikes();

    try {
      const post: PostsEntity[] = await this.postsRepository.findBy({
        id,
        dependencyIsBanned,
        isBanned,
      });

      if (post.length === 0) {
        return null;
      }

      return await this.postsLikesAggregation(
        post,
        numberLastLikes,
        currentUserDto,
      );
    } catch (error) {
      if (await this.uuidErrorResolver.isInvalidUUIDError(error)) {
        const userId = await this.uuidErrorResolver.extractUserIdFromError(
          error,
        );
        throw new NotFoundException(`Post with ID ${userId} not found`);
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async createPosts(
    blog: BloggerBlogsEntity,
    createPostDto: CreatePostDto,
    currentUserDto: CurrentUserDto,
  ): Promise<PostWithLikesInfoViewModel> {
    const postEntity: PostsEntity = PostsEntity.createPostEntity(
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

  /**
   * Retrieves paginated posts within a specific blog and includes information about likes for each post.
   *
   * @param blogId - The unique identifier of the blog for which to retrieve posts.
   * @param queryData - Query parameters for pagination and sorting.
   * @param currentUserDto - Information about the current user (optional).
   * @returns A Promise containing an object with paginated posts and the total count of posts.
   */
  async getPostsInBlogWithPagination(
    blogId: string,
    queryData: ParseQueriesDto,
    currentUserDto: CurrentUserDto | null,
  ): Promise<PostsAndCountDto> {
    // Retrieve common parameters and flags
    const { dependencyIsBanned, isBanned, field, direction, limit, offset } =
      await this.getCommonParamsAndFlags(queryData);

    // Retrieve the number of last likes
    const numberLastLikes = await this.numberLastLikes();

    // Query posts and countPosts with pagination conditions
    const queryBuilder = this.postsRepository
      .createQueryBuilder('post')
      .where('post.dependencyIsBanned = :dependencyIsBanned', {
        dependencyIsBanned,
      })
      .andWhere('post.isBanned = :isBanned', { isBanned })
      .innerJoinAndSelect('post.blog', 'blog')
      .innerJoinAndSelect('post.postOwner', 'postOwner')
      .andWhere('blog.id = :blogId', { blogId });

    queryBuilder.orderBy(field, direction);

    const countPosts = await queryBuilder.getCount();

    const posts = await queryBuilder.skip(offset).take(limit).getMany();

    // Retrieve posts with information about likes
    const postsWithLikes = await this.postsLikesAggregation(
      posts,
      numberLastLikes,
      currentUserDto,
    );

    return {
      posts: postsWithLikes,
      countPosts,
    };
  }

  async getPostsWithPaginationAndCount(
    queryData: ParseQueriesDto,
    currentUserDto: CurrentUserDto | null,
  ): Promise<PostsAndCountDto> {
    // Retrieve common parameters and flags
    const { dependencyIsBanned, isBanned, field, direction, limit, offset } =
      await this.getCommonParamsAndFlags(queryData);

    const numberLastLikes = await this.numberLastLikes();

    const query = this.postsRepository
      .createQueryBuilder('post')
      .where('post.dependencyIsBanned = :dependencyIsBanned', {
        dependencyIsBanned,
      })
      .andWhere('post.isBanned = :isBanned', { isBanned })
      .innerJoinAndSelect('post.blog', 'blog')
      .innerJoinAndSelect('post.postOwner', 'postOwner');

    query.orderBy(field, direction);

    const countPosts = await query.getCount();

    const posts = await query.skip(offset).take(limit).getMany();

    if (posts.length === 0) {
      return {
        posts: [],
        countPosts: 0,
      };
    }

    const postsWithLikes: PostWithLikesInfoViewModel[] =
      await this.postsLikesAggregation(posts, numberLastLikes, currentUserDto);

    return {
      posts: postsWithLikes,
      countPosts,
    };
  }

  async deletePostByPostId(postId: string): Promise<boolean> {
    return this.postsRepository.manager.transaction(async (manager) => {
      try {
        // Delete likes posts associated with the post
        await manager.delete(LikeStatusPostsEntity, { post: { id: postId } });

        // Delete likes comments associated with the post
        await manager.delete(LikeStatusCommentsEntity, {
          post: { id: postId },
        });

        // Delete comments associated with the post
        await manager
          .createQueryBuilder()
          .delete()
          .from('Comments')
          .where('postId = :id', { id: postId })
          .execute();

        // Delete the post itself
        const deleteResult = await manager.delete(PostsEntity, postId);

        if (deleteResult.affected && deleteResult.affected > 0) {
          console.log(`Post with ID ${postId} deleted.`);
          return true;
        } else {
          console.log(`No post found with ID ${postId}.`);
          return false;
        }
      } catch (error) {
        console.error(error);
        throw new InternalServerErrorException(error.message);
      }
    });
  }

  async updatePostByPostId(
    postId: string,
    updatePostDto: UpdatePostDto,
  ): Promise<boolean> {
    try {
      const { title, shortDescription, content } = updatePostDto;

      const result = await this.postsRepository.update(postId, {
        title,
        shortDescription,
        content,
      });

      return result.affected === 1;
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  private async postsLikesAggregation(
    posts: PostsEntity[],
    limitPerPost: number,
    currentUserDto: CurrentUserDto | null,
  ): Promise<PostWithLikesInfoViewModel[]> {
    const result: PostWithLikesInfoViewModel[] = [];

    const postIds = posts.map((post) => post.id);

    const likesInfoArr: LikesDislikesMyStatusInfoDto[] =
      await this.getPostsLikesDislikesMyStatus(postIds, currentUserDto);

    const lookupExtendedLikesInfo = await this.createLookupTable(likesInfoArr);

    for (const post of posts) {
      const postId = post.id; // Get the post ID

      const likesInfo: LikesDislikesMyStatusInfoDto =
        lookupExtendedLikesInfo(postId);

      const lastThreeLikes = await this.getLastThreeLastLikesByPostId(
        postId,
        limitPerPost,
      );

      const lastLikes: NewestLikes[] = lastThreeLikes.reduce(
        (accumulator: NewestLikes[], item: LikeStatusPostsEntity) => {
          accumulator.push({
            addedAt: item.addedAt,
            userId: item.ratedPostUser.userId,
            login: item.ratedPostUser.login,
          });

          return accumulator;
        },
        [],
      );

      result.push({
        id: post.id,
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: post.blog.id,
        blogName: post.blog.name,
        createdAt: post.createdAt,
        extendedLikesInfo: {
          likesCount: Number(likesInfo.likesCount),
          dislikesCount: Number(likesInfo.dislikesCount),
          myStatus: likesInfo.myStatus,
          newestLikes: lastLikes,
        },
      });
    }

    return result;
  }

  private async createLookupTable(
    array: LikesDislikesMyStatusInfoDto[],
  ): Promise<(id: string) => LikesDislikesMyStatusInfoDto> {
    const lookupTable = new Map<string, LikesDislikesMyStatusInfoDto>();

    for (const item of array) {
      lookupTable.set(item.id, item);
    }

    return (id: string) => {
      return (
        lookupTable.get(id) || {
          id,
          likesCount: '0',
          dislikesCount: '0',
          myStatus: LikeStatusEnums.NONE,
        }
      );
    };
  }

  private async getLastThreeLastLikesByPostId(
    postId: string,
    limitPerPost: number,
  ): Promise<LikeStatusPostsEntity[]> {
    try {
      return await this.likePostsRepository
        .createQueryBuilder('likeStatusPosts')
        .leftJoinAndSelect('likeStatusPosts.post', 'post')
        .leftJoinAndSelect('likeStatusPosts.ratedPostUser', 'ratedPostUser')
        .where('likeStatusPosts.postId = :postId', { postId })
        .andWhere('likeStatusPosts.likeStatus = :likeStatus', {
          likeStatus: LikeStatusEnums.LIKE,
        })
        .orderBy('likeStatusPosts.addedAt', 'DESC')
        .take(limitPerPost)
        .getMany();
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  private async getPostsLikesDislikesMyStatus(
    postIds: string[],
    currentUserDto: CurrentUserDto | null,
  ): Promise<LikesDislikesMyStatusInfoDto[]> {
    try {
      return this.likePostsRepository
        .createQueryBuilder('likeStatusPosts')
        .select([
          'likeStatusPosts.postId AS "id"',
          'COUNT(CASE WHEN likeStatusPosts.likeStatus = :likeStatus THEN 1 ELSE NULL END) AS "likesCount"',
          'COUNT(CASE WHEN likeStatusPosts.likeStatus = :dislikeStatus THEN 1 ELSE NULL END) AS "dislikesCount"',
          'COALESCE(MAX(CASE WHEN likeStatusPosts.ratedPostUser.userId = :userId THEN likeStatusPosts.likeStatus ELSE NULL END), \'None\') AS "myStatus"',
        ])
        .where('likeStatusPosts.postId IN (:...postIds)', {
          postIds,
        })
        .andWhere('likeStatusPosts.isBanned = :isBanned', { isBanned: false })
        .setParameters({
          likeStatus: LikeStatusEnums.LIKE,
          dislikeStatus: LikeStatusEnums.DISLIKE,
          userId: currentUserDto?.userId,
        })
        .groupBy('likeStatusPosts.postId')
        .getRawMany();
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  private async addExtendedLikesInfoToPostsEntity(
    newPost: PostViewModel,
  ): Promise<PostWithLikesInfoViewModel> {
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

  private async getCommonParamsAndFlags(queryData: ParseQueriesDto) {
    const bannedFlags: BannedFlagsDto = await this.getBannedFlags();
    const { dependencyIsBanned, isBanned } = bannedFlags;

    const { sortDirection, pageSize, pageNumber, sortBy } =
      queryData.queryPagination;

    const field: string = await this.getSortByField(sortBy);
    const direction: SortDirectionEnum = sortDirection;
    const limit: number = pageSize;
    const offset: number = (pageNumber - 1) * limit;

    return { dependencyIsBanned, isBanned, field, direction, limit, offset };
  }

  private async numberLastLikes(): Promise<number> {
    return 3;
  }

  private async getSortByField(sortBy: string): Promise<string> {
    return await this.keyResolver.resolveKey(
      sortBy,
      [
        'title',
        'shortDescription',
        'content',
        'blogName',
        'dependencyIsBanned',
        'isBanned',
        'banDate',
        'banReason',
      ],
      'createdAt',
    );
  }
}

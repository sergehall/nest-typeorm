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
  NewestLikes,
  ReturnPostsEntity,
} from '../entities/return-posts.entity';
import { BannedFlagsDto } from '../dto/banned-flags.dto';
import { PagingParamsDto } from '../../../common/pagination/dto/paging-params.dto';
import {
  ParseQueriesDto,
  SortDirection,
} from '../../../common/query/dto/parse-queries.dto';
import { LikeStatusPostsEntity } from '../entities/like-status-posts.entity';
import { KeyResolver } from '../../../common/helpers/key-resolver';
import { LikeStatusEnums } from '../../../config/db/mongo/enums/like-status.enums';
import { PostsAndCountDto } from '../dto/posts-and-count.dto';
import { CommentsEntity } from '../../comments/entities/comments.entity';

export class PostsRepo {
  constructor(
    protected keyResolver: KeyResolver,
    @InjectRepository(PostsEntity)
    private readonly postsRepository: Repository<PostsEntity>,
    @InjectRepository(LikeStatusPostsEntity)
    private readonly likePostsRepository: Repository<LikeStatusPostsEntity>,
    @InjectRepository(CommentsEntity)
    private readonly commentsRepository: Repository<CommentsEntity>,
  ) {}

  async getPostByIdWithoutLikes(id: string): Promise<PostsEntity | null> {
    try {
      console.log('+++++++++');
      const bannedFlags: BannedFlagsDto = await this.getBannedFlags();
      const { dependencyIsBanned, isBanned } = bannedFlags;

      const post = await this.postsRepository.findBy({
        id,
        dependencyIsBanned,
        isBanned,
      });
      console.log(post, 'post2');
      return post[0] ? post[0] : null;
    } catch (error) {
      if (await this.isInvalidUUIDError(error)) {
        const userId = await this.extractUserIdFromError(error);
        throw new NotFoundException(`Post with ID ${userId} not found`);
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async getPostByIdWithLikes(
    id: string,
    currentUserDto: CurrentUserDto | null,
  ): Promise<ReturnPostsEntity[] | null> {
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
    // Retrieve banned flags
    const bannedFlags: BannedFlagsDto = await this.getBannedFlags();
    const { dependencyIsBanned, isBanned } = bannedFlags;

    // Retrieve paging parameters
    const pagingParams: PagingParamsDto = await this.getPagingParams(queryData);
    const { sortBy, direction, limit, offset } = pagingParams;

    // Retrieve the number of last likes
    const numberLastLikes = await this.numberLastLikes();

    // Retrieve the order field for sorting
    const orderByField = await this.getOrderField(sortBy);

    // Query posts and countPosts with pagination conditions
    const query = this.postsRepository
      .createQueryBuilder('post')
      .where('post.dependencyIsBanned = :dependencyIsBanned', {
        dependencyIsBanned,
      })
      .andWhere('post.isBanned = :isBanned', { isBanned })
      .innerJoinAndSelect('post.blog', 'blog')
      .innerJoinAndSelect('post.postOwner', 'postOwner')
      .andWhere('blog.id = :blogId', { blogId });

    query.orderBy(orderByField, direction);

    const countPosts = await query.getCount();

    const posts = await query.skip(offset).take(limit).getMany();

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
    // Retrieve banned flags
    const bannedFlags: BannedFlagsDto = await this.getBannedFlags();
    const { dependencyIsBanned, isBanned } = bannedFlags;

    // Retrieve paging parameters
    const pagingParams: PagingParamsDto = await this.getPagingParams(queryData);
    const { sortBy, direction, limit, offset } = pagingParams;

    const numberLastLikes = await this.numberLastLikes();

    const orderByField = await this.getOrderField(sortBy);

    const query = this.postsRepository
      .createQueryBuilder('post')
      .where('post.dependencyIsBanned = :dependencyIsBanned', {
        dependencyIsBanned,
      })
      .andWhere('post.isBanned = :isBanned', { isBanned })
      .innerJoinAndSelect('post.blog', 'blog')
      .innerJoinAndSelect('post.postOwner', 'postOwner');

    query.orderBy(orderByField, direction);

    const countPosts = await query.getCount();

    const posts = await query.skip(offset).take(limit).getMany();

    if (posts.length === 0) {
      return {
        posts: [],
        countPosts: 0,
      };
    }

    const postsWithLikes: ReturnPostsEntity[] =
      await this.postsLikesAggregation(posts, numberLastLikes, currentUserDto);

    return {
      posts: postsWithLikes,
      countPosts,
    };
  }

  async deletePostByPostId(postId: string): Promise<boolean> {
    return this.postsRepository.manager.transaction(async (manager) => {
      try {
        // Delete likes associated with the post
        await manager.delete(LikeStatusPostsEntity, { post: { id: postId } });

        // Delete comments associated with the post
        await manager.delete(LikeStatusPostsEntity, {
          post: { id: postId },
        });

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

  private async getOrderField(field: string): Promise<string> {
    let orderByString;

    switch (field) {
      case 'blogName':
        orderByString = 'blog.name';
        break;
      case 'title':
        orderByString = 'post.title';
        break;
      case 'shortDescription':
        orderByString = 'post.shortDescription ';
        break;
      case 'content':
        orderByString = 'post.content';
        break;
      case 'dependencyIsBanned':
        orderByString = 'post.dependencyIsBanned';
        break;
      case 'isBanned':
        orderByString = 'post.isBanned';
        break;
      case 'banDate':
        orderByString = 'post.banDate';
        break;
      case 'banReason':
        orderByString = 'post.banReason';
        break;
      case 'createdAt':
        orderByString = 'post.createdAt';
        break;
      default:
        throw new Error('Invalid field in getOrderField(field: string)');
    }

    return orderByString;
  }

  private async postsLikesAggregation(
    posts: PostsEntity[],
    numberLastLikes: number,
    currentUserDto: CurrentUserDto | null,
  ): Promise<ReturnPostsEntity[]> {
    // Extract post IDs
    const postIds = posts.map((post) => post.id);

    // Query like status data for the posts
    const likeStatusPostsData: LikeStatusPostsEntity[] =
      await this.likePostsRepository
        .createQueryBuilder('likeStatusPosts')
        .leftJoinAndSelect('likeStatusPosts.post', 'post')
        .leftJoinAndSelect('likeStatusPosts.ratedPostUser', 'ratedPostUser')
        .where('likeStatusPosts.post.id IN (:...postIds)', { postIds })
        .orderBy('likeStatusPosts.addedAt', 'DESC')
        .take(numberLastLikes) // Limit the number of retrieved likes per post
        .getMany();

    // Process posts and associated like data
    return posts.map((post: PostsEntity): ReturnPostsEntity => {
      const filteredData: LikeStatusPostsEntity[] = likeStatusPostsData.filter(
        (item: LikeStatusPostsEntity) => item.post.id === post.id,
      );

      // Create an array of last likes for the post
      const lastLikes: NewestLikes[] = filteredData.map(
        (item: LikeStatusPostsEntity): NewestLikes => ({
          addedAt: item.addedAt,
          userId: item.ratedPostUser.userId,
          login: item.ratedPostUser.login,
        }),
      );

      // Count likes and dislikes
      const likesCount = filteredData.filter(
        (item: LikeStatusPostsEntity) =>
          item.likeStatus === LikeStatusEnums.LIKE,
      ).length;
      const dislikesCount = filteredData.filter(
        (item: LikeStatusPostsEntity) =>
          item.likeStatus === LikeStatusEnums.DISLIKE,
      ).length;

      // Determine the user's status for the post
      let myStatus: LikeStatusEnums = LikeStatusEnums.NONE;
      if (
        currentUserDto &&
        filteredData[0] &&
        currentUserDto.userId === filteredData[0].ratedPostUser.userId
      ) {
        myStatus = filteredData[0].likeStatus;
      }

      // Construct the posts data with extended likes information
      return {
        id: post.id,
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: post.blog.id,
        blogName: post.blog.name,
        createdAt: post.createdAt,
        extendedLikesInfo: {
          likesCount: likesCount,
          dislikesCount: dislikesCount,
          myStatus: myStatus,
          newestLikes: lastLikes,
        },
      };
    });
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
    const { sortDirection, pageSize, pageNumber } = queryData.queryPagination;

    const sortBy: string = await this.getSortBy(
      queryData.queryPagination.sortBy,
    );
    const direction: SortDirection = sortDirection;
    const limit: number = pageSize;
    const offset: number = (pageNumber - 1) * limit;

    return { sortBy, direction, limit, offset };
  }

  private async numberLastLikes(): Promise<number> {
    return 3;
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
        'isBanned',
        'banDate',
        'banReason',
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

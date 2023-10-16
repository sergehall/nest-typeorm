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
import {
  ExtendedLikesInfo,
  NewestLikes,
  PostWithLikesInfoViewModel,
} from '../view-models/post-with-likes-info.view-model';
import { BannedFlagsDto } from '../dto/banned-flags.dto';
import { PagingParamsDto } from '../../../common/pagination/dto/paging-params.dto';
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
    const queryBuilder = this.postsRepository
      .createQueryBuilder('post')
      .where('post.dependencyIsBanned = :dependencyIsBanned', {
        dependencyIsBanned,
      })
      .andWhere('post.isBanned = :isBanned', { isBanned })
      .innerJoinAndSelect('post.blog', 'blog')
      .innerJoinAndSelect('post.postOwner', 'postOwner')
      .andWhere('blog.id = :blogId', { blogId });

    queryBuilder.orderBy(orderByField, direction);

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

  private async getOrderField(field: string): Promise<string> {
    let orderByString;
    try {
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
        default:
          orderByString = 'post.createdAt';
      }

      return orderByString;
    } catch (error) {
      console.log(error.message);
      throw new Error('Invalid field in getOrderField(field: string)');
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

  // private async getLikesDislikesMyStatus(
  //   postId: string,
  //   currentUserDto: CurrentUserDto | null,
  // ): Promise<LikesDislikesMyStatusInfoDto[]> {
  //   try {
  //     return this.likePostsRepository
  //       .createQueryBuilder('likeStatusPosts')
  //       .select([
  //         'likeStatusPosts.postId AS "id"',
  //         'COUNT(CASE WHEN likeStatusPosts.likeStatus = :likeStatus THEN 1 ELSE NULL END) AS "likesCount"',
  //         'COUNT(CASE WHEN likeStatusPosts.likeStatus = :dislikeStatus THEN 1 ELSE NULL END) AS "dislikesCount"',
  //         'MAX(CASE WHEN likeStatusPosts.ratedPostUser.userId = :userId THEN likeStatusPosts.likeStatus ELSE NULL END) AS "myStatus"',
  //       ])
  //       .where('likeStatusPosts.postId = :postId', { postId })
  //       .andWhere('likeStatusPosts.isBanned = :isBanned', { isBanned: false })
  //       .setParameters({
  //         likeStatus: LikeStatusEnums.LIKE,
  //         dislikeStatus: LikeStatusEnums.DISLIKE,
  //         userId: currentUserDto?.userId,
  //       })
  //       .groupBy('likeStatusPosts.postId')
  //       .getRawMany();
  //   } catch (error) {
  //     console.log(error.message);
  //     throw new InternalServerErrorException(error.message);
  //   }
  // }

  // async postsLikesAggregation(
  //   posts: PostsEntity[],
  //   numberLastLikes: number,
  //   currentUserDto: CurrentUserDto | null,
  // ): Promise<PostWithLikesInfoViewModel[]> {
  //   const result: PostWithLikesInfoViewModel[] = [];
  //
  //   for (const post of posts) {
  //     const queryBuilder: SelectQueryBuilder<LikeStatusPostsEntity> =
  //       this.likePostsRepository.createQueryBuilder('likeStatusPosts');
  //
  //     const postId = post.id; // Get the post ID
  //
  //     queryBuilder
  //       .select([
  //         'likeStatusPosts.id',
  //         'likeStatusPosts.likeStatus',
  //         'likeStatusPosts.addedAt',
  //         'likeStatusPosts.isBanned',
  //       ])
  //       .leftJoinAndSelect('likeStatusPosts.post', 'post')
  //       .leftJoinAndSelect('likeStatusPosts.ratedPostUser', 'ratedPostUser')
  //       .where('likeStatusPosts.post.id = :postId', { postId })
  //       .andWhere('likeStatusPosts.isBanned = :isBanned', { isBanned: false })
  //       .orderBy('likeStatusPosts.addedAt', 'DESC');
  //
  //     const likeStatusPosts: LikeStatusPostsEntity[] =
  //       await queryBuilder.getMany();
  //
  //     const likeCount = likeStatusPosts.filter(
  //       (post) => post.likeStatus === LikeStatusEnums.LIKE,
  //     ).length;
  //     const dislikeCount = likeStatusPosts.filter(
  //       (post) => post.likeStatus === LikeStatusEnums.DISLIKE,
  //     ).length;
  //
  //     let myStatus: LikeStatusEnums = LikeStatusEnums.NONE;
  //
  //     if (currentUserDto) {
  //       const myLikeStatusPost = likeStatusPosts.find(
  //         (post) => post.ratedPostUser.userId === currentUserDto.userId,
  //       );
  //
  //       if (myLikeStatusPost) {
  //         myStatus = myLikeStatusPost.likeStatus;
  //       }
  //     }
  //
  //     const lastLikes: NewestLikes[] = likeStatusPosts.reduce(
  //       (accumulator: NewestLikes[], item: LikeStatusPostsEntity) => {
  //         if (accumulator.length === numberLastLikes) {
  //           return accumulator; // Stop adding items once we have 3
  //         }
  //
  //         if (item.likeStatus === LikeStatusEnums.LIKE) {
  //           accumulator.push({
  //             addedAt: item.addedAt,
  //             userId: item.ratedPostUser.userId,
  //             login: item.ratedPostUser.login,
  //           });
  //         }
  //
  //         return accumulator;
  //       },
  //       [],
  //     );
  //
  //     result.push({
  //       id: post.id,
  //       title: post.title,
  //       shortDescription: post.shortDescription,
  //       content: post.content,
  //       blogId: post.blog.id,
  //       blogName: post.blog.name,
  //       createdAt: post.createdAt,
  //       extendedLikesInfo: {
  //         likesCount: likeCount,
  //         dislikesCount: dislikeCount,
  //         myStatus: myStatus,
  //         newestLikes: lastLikes,
  //       },
  //     });
  //   }
  //
  //   return result;
  // }

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

  private async getPagingParams(
    queryData: ParseQueriesDto,
  ): Promise<PagingParamsDto> {
    const { sortDirection, pageSize, pageNumber } = queryData.queryPagination;

    const sortBy: string = await this.getSortBy(
      queryData.queryPagination.sortBy,
    );
    const direction: SortDirectionEnum = sortDirection;
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
}

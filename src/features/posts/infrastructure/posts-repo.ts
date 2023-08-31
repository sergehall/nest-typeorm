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
import { BannedFlagsDto } from '../dto/banned-flags.dto';
import { PagingParamsDto } from '../../../common/pagination/dto/paging-params.dto';
import {
  ParseQueriesDto,
  SortDirection,
} from '../../../common/query/dto/parse-queries.dto';
import { LikeStatusPostsEntity } from '../entities/like-status-posts.entity';
import { KeyResolver } from '../../../common/helpers/key-resolver';
import { LikeStatusEnums } from '../../../config/db/mongo/enums/like-status.enums';
import { PostsLastThreeLikesMyStatusCountLikesDislikesDto } from '../dto/posts-last-three-likes-my-status-count-likes-dislikes.dto';
import { PostsAndCountDto } from '../dto/posts-and-count.dto';

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
  ): Promise<PostsAndCountDto> {
    const bannedFlags: BannedFlagsDto = await this.getBannedFlags();

    const pagingParams: PagingParamsDto = await this.getPagingParams(queryData);
    const { dependencyIsBanned, isBanned } = bannedFlags;
    const { sortBy, direction, limit, offset } = pagingParams;
    const numberLastLikes = 3;
    const likeStatus = LikeStatusEnums.LIKE;

    // Query posts with pagination conditions
    const [posts, countPosts] = await this.postsRepository.findAndCount({
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
    const postsWithLikesAndStatus: PostsLastThreeLikesMyStatusCountLikesDislikesDto[] =
      await Promise.all(
        posts.map(
          async (
            post: PostsEntity,
          ): Promise<PostsLastThreeLikesMyStatusCountLikesDislikesDto> => {
            let myStatus = LikeStatusEnums.NONE;
            if (currentUserDto) {
              const status: LikeStatusPostsEntity | null =
                await this.likePostsRepository.findOne({
                  where: {
                    post: { id: post.id },
                    ratedPostUser: { userId: currentUserDto.userId },
                  },
                });
              if (status) {
                myStatus = status.likeStatus;
              }
            }

            const lastLikes: LikeStatusPostsEntity[] =
              await this.likePostsRepository.find({
                where: {
                  post: { id: post.id },
                  likeStatus: likeStatus,
                },
                order: { addedAt: 'DESC' },
                take: numberLastLikes,
              });

            const likesCount: number = await this.likePostsRepository.count({
              where: {
                post: { id: post.id },
                likeStatus: LikeStatusEnums.LIKE, // Assuming 'Like' is the status for likes
              },
            });

            const dislikesCount: number = await this.likePostsRepository.count({
              where: {
                post: { id: post.id },
                likeStatus: LikeStatusEnums.DISLIKE, // Assuming 'Dislike' is the status for dislikes
              },
            });

            return {
              post,
              lastLikes,
              myStatus,
              likesCount,
              dislikesCount,
            };
          },
        ),
      );

    const processedPosts: ReturnPostsEntity[] =
      await this.processPostsWithLikes(postsWithLikesAndStatus, currentUserDto);
    return {
      posts: processedPosts,
      countPosts,
    };
  }

  private async processPostsWithLikes(
    postsWithLikes: PostsLastThreeLikesMyStatusCountLikesDislikesDto[],
    currentUserDto: CurrentUserDto | null,
  ): Promise<ReturnPostsEntity[]> {
    const postWithLikes: { [key: string]: ReturnPostsEntity } = {};

    return postsWithLikes.reduce<ReturnPostsEntity[]>(
      (
        result: ReturnPostsEntity[],
        row: PostsLastThreeLikesMyStatusCountLikesDislikesDto,
      ) => {
        const post = row.post;
        const postId = row.post.id;
        const likesCount = row.likesCount;
        const dislikesCount = row.dislikesCount;
        const myStatus = currentUserDto ? row.myStatus : LikeStatusEnums.NONE;
        let postEntity = postWithLikes[postId];
        if (!postEntity) {
          const transformLikes = (
            likes: LikeStatusPostsEntity[],
          ): { addedAt: string; userId: string; login: string }[] => {
            return likes.map((l: LikeStatusPostsEntity) => ({
              addedAt: l.addedAt,
              userId: l.ratedPostUser.userId,
              login: l.ratedPostUser.login,
            }));
          };
          postEntity = {
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
              newestLikes: transformLikes(row.lastLikes),
            },
          };
          postWithLikes[postId] = postEntity;
          result.push(postEntity);
        }
        return result;
      },
      [],
    );
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

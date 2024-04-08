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
import { PostWithLikesInfoViewModel } from '../views/post-with-likes-info.view-model';
import { BannedFlagsDto } from '../dto/banned-flags.dto';
import { ParseQueriesDto } from '../../../common/query/dto/parse-queries.dto';
import { LikeStatusPostsEntity } from '../entities/like-status-posts.entity';
import { KeyResolver } from '../../../common/helpers/key-resolver';
import { PostsAndCountDto } from '../dto/posts-and-count.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { LikeStatusCommentsEntity } from '../../comments/entities/like-status-comments.entity';
import { SortDirectionEnum } from '../../../common/query/enums/sort-direction.enum';
import { UuidErrorResolver } from '../../../common/helpers/uuid-error-resolver';
import { PostViewModel } from '../views/post.view-model';
import { LikeStatusPostsRepo } from './like-status-posts.repo';
import { ImagesPostsOriginalMetadataEntity } from '../entities/images-post-original-metadata.entity';

export class PostsRepo {
  constructor(
    @InjectRepository(PostsEntity)
    protected postsRepository: Repository<PostsEntity>,
    protected likeStatusPostsRepo: LikeStatusPostsRepo,
    protected keyResolver: KeyResolver,
    protected uuidErrorResolver: UuidErrorResolver,
  ) {}

  async getPostByIdWithoutLikes(id: string): Promise<PostsEntity | null> {
    const bannedFlags: BannedFlagsDto = await this.getBannedFlags();
    const { dependencyIsBanned, isBanned } = bannedFlags;

    try {
      const post: PostsEntity[] = await this.postsRepository.findBy({
        id,
        dependencyIsBanned,
        isBanned,
      });

      return post[0] ? post[0] : null;
    } catch (error) {
      if (await this.uuidErrorResolver.isInvalidUUIDError(error)) {
        const userId =
          await this.uuidErrorResolver.extractUserIdFromError(error);
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

      return await this.likeStatusPostsRepo.postsLikesAggregation(
        post,
        numberLastLikes,
        currentUserDto,
      );
    } catch (error) {
      if (await this.uuidErrorResolver.isInvalidUUIDError(error)) {
        const userId =
          await this.uuidErrorResolver.extractUserIdFromError(error);
        throw new NotFoundException(`Post with ID ${userId} not found`);
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async createPost(
    blog: BloggerBlogsEntity,
    createPostDto: CreatePostDto,
    currentUserDto: CurrentUserDto,
  ): Promise<PostViewModel> {
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

      return result.raw[0];
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

    // Retrieve common parameters
    const { sortDirection, sortBy, pageNumber, pageSize } =
      queryData.queryPagination;

    const field: string = await this.getSortByField(sortBy);
    const direction: SortDirectionEnum = sortDirection;
    const limit: number = pageSize;
    const offset: number = (pageNumber - 1) * limit;

    // Retrieve the number of last likes
    const numberLastLikes = await this.numberLastLikes();

    // Query posts and countPosts with pagination conditions
    const queryBuilder = this.postsRepository
      .createQueryBuilder('posts')
      .where({ dependencyIsBanned })
      .andWhere({ isBanned })
      .leftJoinAndSelect('posts.blog', 'blog')
      .leftJoinAndSelect('posts.postOwner', 'postOwner')
      .andWhere('blog.id = :blogId', { blogId });

    queryBuilder.orderBy(`posts.${field}`, direction);

    try {
      const countPosts = await queryBuilder.getCount();

      const posts: PostsEntity[] = await queryBuilder
        .skip(offset)
        .take(limit)
        .getMany();

      console.log(posts);

      // Retrieve posts with information about likes
      const postsWithLikes =
        await this.likeStatusPostsRepo.postsLikesAggregation(
          posts,
          numberLastLikes,
          currentUserDto,
        );

      return {
        posts: postsWithLikes,
        countPosts,
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async getPostsWithPaginationAndCount(
    queryData: ParseQueriesDto,
    currentUserDto: CurrentUserDto | null,
  ): Promise<PostsAndCountDto> {
    // Retrieve banned flags
    const bannedFlags: BannedFlagsDto = await this.getBannedFlags();
    const { dependencyIsBanned, isBanned } = bannedFlags;

    // Retrieve common parameters
    const { sortDirection, sortBy, pageNumber, pageSize } =
      queryData.queryPagination;

    const field: string = await this.getSortByField(sortBy);
    const direction: SortDirectionEnum = sortDirection;
    const limit: number = pageSize;
    const offset: number = (pageNumber - 1) * limit;

    const numberLastLikes = await this.numberLastLikes();

    const queryBuilder = this.postsRepository
      .createQueryBuilder('posts')
      .leftJoinAndSelect('posts.blog', 'blog')
      .leftJoinAndSelect('posts.postOwner', 'postOwner')
      .where({ dependencyIsBanned })
      .andWhere({ isBanned });

    queryBuilder.orderBy(`posts.${field}`, direction);

    const countPosts: number = await queryBuilder.getCount();

    const posts: PostsEntity[] = await queryBuilder
      .offset(offset)
      .limit(limit)
      .getMany();

    if (posts.length === 0) {
      return {
        posts: [],
        countPosts: 0,
      };
    }

    const postsWithLikes: PostWithLikesInfoViewModel[] =
      await this.likeStatusPostsRepo.postsLikesAggregation(
        posts,
        numberLastLikes,
        currentUserDto,
      );

    return {
      posts: postsWithLikes,
      countPosts,
    };
  }

  async deletePostByPostId(postId: string): Promise<boolean> {
    return this.postsRepository.manager.transaction(async (manager) => {
      try {
        // Delete files associated with the post
        await manager.delete(ImagesPostsOriginalMetadataEntity, {
          post: { id: postId },
        });

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

  private async getBannedFlags(): Promise<BannedFlagsDto> {
    return {
      commentatorInfoIsBanned: false,
      dependencyIsBanned: false,
      banInfoIsBanned: false,
      isBanned: false,
    };
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

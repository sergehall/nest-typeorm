import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import * as uuid4 from 'uuid4';
import { PaginationDto } from '../infrastructure/common/pagination/dto/pagination.dto';
import { Pagination } from '../infrastructure/common/pagination/pagination';
import { PostsRepository } from './infrastructure/posts.repository';
import { PostsEntity } from './entities/posts.entity';
import { CaslAbilityFactory } from '../ability/casl-ability.factory';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../ability/roles/action.enum';
import { QueryArrType } from '../infrastructure/common/convert-filters/types/convert-filter.types';
import { StatusLike } from '../infrastructure/database/enums/like-status.enums';
import { LikeStatusDto } from '../comments/dto/like-status.dto';
import { LikeStatusPostEntity } from './entities/like-status-post.entity';
import { UsersEntity } from '../users/entities/users.entity';
import { LikeStatusPostsRepository } from './infrastructure/like-status-posts.repository';
import { UpdatePostsEntity } from './entities/update-posts.entity';
import { CreatePostAndNameDto } from './dto/create-post-and-name.dto';

@Injectable()
export class PostsService {
  constructor(
    protected pagination: Pagination,
    protected postsRepository: PostsRepository,
    protected caslAbilityFactory: CaslAbilityFactory,
    protected likeStatusPostsRepository: LikeStatusPostsRepository,
  ) {}

  async createPost(createPostDto: CreatePostAndNameDto) {
    const newPost = {
      id: uuid4().toString(),
      title: createPostDto.title,
      shortDescription: createPostDto.shortDescription,
      content: createPostDto.content,
      blogId: createPostDto.blogId,
      blogName: createPostDto.name,
      createdAt: new Date().toISOString(),
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: StatusLike.NONE,
        newestLikes: [],
      },
    };

    const result = await this.postsRepository.createPost(newPost);
    return {
      id: result.id,
      title: result.title,
      shortDescription: result.shortDescription,
      content: result.content,
      blogId: result.blogId,
      blogName: result.blogName,
      createdAt: result.createdAt,
      extendedLikesInfo: {
        likesCount: result.extendedLikesInfo.likesCount,
        dislikesCount: result.extendedLikesInfo.dislikesCount,
        myStatus: result.extendedLikesInfo.myStatus,
        newestLikes: result.extendedLikesInfo.newestLikes,
      },
    };
  }

  async findPosts(
    queryPagination: PaginationDto,
    searchFilters: QueryArrType,
    currentUser: UsersEntity | null,
  ) {
    let field = 'createdAt';
    if (
      queryPagination.sortBy === 'title' ||
      queryPagination.sortBy === 'shortDescription' ||
      queryPagination.sortBy === 'blogName' ||
      queryPagination.sortBy === 'content'
    ) {
      field = queryPagination.sortBy;
    }
    const pagination = await this.pagination.convert(queryPagination, field);
    const totalCount = await this.postsRepository.countDocuments(searchFilters);
    const pagesCount = Math.ceil(totalCount / queryPagination.pageSize);
    const posts: PostsEntity[] = await this.postsRepository.findPosts(
      pagination,
      searchFilters,
    );
    const filledPost =
      await this.likeStatusPostsRepository.preparationPostsForReturn(
        posts,
        currentUser,
      );
    const pageNumber = queryPagination.pageNumber;
    const pageSize = pagination.pageSize;
    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: filledPost,
    };
  }

  async findPostById(
    postId: string,
    currentUser: UsersEntity | null,
  ): Promise<PostsEntity | null> {
    const post = await this.postsRepository.findPostById(postId);
    if (!post) throw new NotFoundException();
    const filledPost =
      await this.likeStatusPostsRepository.preparationPostsForReturn(
        [post],
        currentUser,
      );
    return filledPost[0];
  }
  async checkPostInDB(postId: string): Promise<PostsEntity | null> {
    return await this.postsRepository.checkPostInDB(postId);
  }

  async updatePost(id: string, updatePostDto: CreatePostDto) {
    const postToUpdate: PostsEntity | null =
      await this.postsRepository.findPostById(id);
    if (!postToUpdate) throw new NotFoundException();
    const ability = this.caslAbilityFactory.createForPost({ id: id });
    try {
      ForbiddenError.from(ability).throwUnlessCan(Action.UPDATE, {
        id: postToUpdate.id,
      });
      const postsEntity: UpdatePostsEntity = {
        id: postToUpdate.id,
        title: updatePostDto.title,
        shortDescription: updatePostDto.shortDescription,
        content: updatePostDto.content,
        blogId: postToUpdate.blogId,
      };
      return await this.postsRepository.updatePost(postsEntity);
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      }
    }
  }

  async removePost(id: string): Promise<boolean | undefined> {
    const postToDelete = await this.postsRepository.findPostById(id);
    if (!postToDelete) {
      throw new NotFoundException();
    }
    const ability = this.caslAbilityFactory.createForPost({ id: id });
    try {
      ForbiddenError.from(ability).throwUnlessCan(Action.DELETE, {
        id: postToDelete.id,
      });
      return await this.postsRepository.removePost(id);
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      }
    }
  }
  async changeLikeStatusPost(
    postId: string,
    likeStatusDto: LikeStatusDto,
    currentUser: UsersEntity,
  ) {
    const post = await this.postsRepository.findPostById(postId);
    if (!post) throw new NotFoundException();
    const likeStatusPostEntity: LikeStatusPostEntity = {
      postId: postId,
      userId: currentUser.id,
      login: currentUser.login,
      likeStatus: likeStatusDto.likeStatus,
      addedAt: new Date().toISOString(),
    };
    return await this.likeStatusPostsRepository.updateLikeStatusPost(
      likeStatusPostEntity,
    );
  }
}

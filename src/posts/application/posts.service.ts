import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginationDto } from '../../infrastructure/common/pagination/dto/pagination.dto';
import { Pagination } from '../../infrastructure/common/pagination/pagination';
import { PostsRepository } from '../infrastructure/posts.repository';
import { PostsEntity } from '../entities/posts.entity';
import { QueryArrType } from '../../infrastructure/common/convert-filters/types/convert-filter.types';
import { UsersEntity } from '../../users/entities/users.entity';
import { LikeStatusPostsRepository } from '../infrastructure/like-status-posts.repository';
import { PostsWithoutOwnersInfoEntity } from '../entities/posts-without-ownerInfo.entity';

@Injectable()
export class PostsService {
  constructor(
    protected pagination: Pagination,
    protected postsRepository: PostsRepository,
    protected likeStatusPostsRepository: LikeStatusPostsRepository,
  ) {}

  async findPosts(
    queryPagination: PaginationDto,
    searchFilters: QueryArrType,
    currentUser: UsersEntity | null,
  ) {
    const field = queryPagination.sortBy;
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
  ): Promise<PostsWithoutOwnersInfoEntity | null> {
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
}

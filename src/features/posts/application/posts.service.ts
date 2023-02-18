import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginationDto } from '../../common/pagination/dto/pagination.dto';
import { Pagination } from '../../common/pagination/pagination';
import { PostsRepository } from '../infrastructure/posts.repository';
import { PostsEntity } from '../entities/posts.entity';
import { QueryArrType } from '../../common/convert-filters/types/convert-filter.types';
import { LikeStatusPostsRepository } from '../infrastructure/like-status-posts.repository';
import { PostsWithoutOwnersInfoEntity } from '../entities/posts-without-ownerInfo.entity';
import { ConvertFiltersForDB } from '../../common/convert-filters/convertFiltersForDB';
import { CurrentUserDto } from '../../users/dto/currentUser.dto';

@Injectable()
export class PostsService {
  constructor(
    protected convertFiltersForDB: ConvertFiltersForDB,
    protected pagination: Pagination,
    protected postsRepository: PostsRepository,
    protected likeStatusPostsRepository: LikeStatusPostsRepository,
  ) {}

  async findPosts(
    queryPagination: PaginationDto,
    searchFilters: QueryArrType,
    currentUserDto: CurrentUserDto | null,
  ) {
    const field = queryPagination.sortBy;
    const convertedFilters = await this.convertFiltersForDB.convert(
      searchFilters,
    );
    convertedFilters.push({ 'postOwnerInfo.isBanned': false });
    convertedFilters.push({ 'banInfo.isBanned': false });
    const pagination = await this.pagination.convert(queryPagination, field);
    const totalCount = await this.postsRepository.countDocuments(
      convertedFilters,
    );
    const pagesCount = Math.ceil(totalCount / queryPagination.pageSize);
    const posts: PostsEntity[] = await this.postsRepository.findPosts(
      pagination,
      convertedFilters,
    );
    const filledPost =
      await this.likeStatusPostsRepository.preparationPostsForReturn(
        posts,
        currentUserDto,
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

  async openFindPostById(
    postId: string,
    currentUserDto: CurrentUserDto | null,
  ): Promise<PostsWithoutOwnersInfoEntity | null> {
    const searchFilters = [];
    searchFilters.push({ id: postId });
    searchFilters.push({ 'postOwnerInfo.isBanned': false });
    searchFilters.push({ 'banInfo.isBanned': false });
    const post = await this.postsRepository.openFindPostById(searchFilters);
    if (!post) throw new NotFoundException();
    const filledPost =
      await this.likeStatusPostsRepository.preparationPostsForReturn(
        [post],
        currentUserDto,
      );
    return filledPost[0];
  }
  async checkPostInDB(postId: string): Promise<PostsEntity | null> {
    return await this.postsRepository.checkPostInDB(postId);
  }
}

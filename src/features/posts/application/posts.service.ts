import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginationDto } from '../../common/pagination/dto/pagination.dto';
import { Pagination } from '../../common/pagination/pagination';
import { PostsRepository } from '../infrastructure/posts.repository';
import { PostsEntity } from '../entities/posts.entity';
import { QueryArrType } from '../../common/convert-filters/types/convert-filter.types';
import { LikeStatusPostsRepository } from '../infrastructure/like-status-posts.repository';
import { PostsReturnEntity } from '../entities/posts-without-ownerInfo.entity';
import { ConvertFiltersForDB } from '../../common/convert-filters/convertFiltersForDB';
import { CurrentUserDto } from '../../users/dto/currentUser.dto';
import { PaginationTypes } from '../../common/pagination/types/pagination.types';
import { ParseQueryType } from '../../common/parse-query/parse-query';
import { PostsRawSqlRepository } from '../infrastructure/posts-raw-sql.repository';
import { PostsRawSqlEntity } from '../entities/posts-raw-sql.entity';

@Injectable()
export class PostsService {
  constructor(
    protected convertFiltersForDB: ConvertFiltersForDB,
    protected pagination: Pagination,
    protected postsRepository: PostsRepository,
    protected postsRawSqlRepository: PostsRawSqlRepository,
    protected likeStatusPostsRepository: LikeStatusPostsRepository,
  ) {}

  async findPosts2(
    queryData: ParseQueryType,
    currentUserDto: CurrentUserDto | null,
  ): Promise<PaginationTypes> {
    const postOwnerIsBanned = false;
    const banInfoBanStatus = false;
    const posts: PostsRawSqlEntity[] =
      await this.postsRawSqlRepository.openFindPosts(
        queryData,
        postOwnerIsBanned,
        banInfoBanStatus,
      );
    const filledPosts =
      await this.likeStatusPostsRepository.preparationPostsForReturn2(
        posts,
        currentUserDto,
      );
    const totalCountPosts = await this.postsRawSqlRepository.totalCountPosts(
      postOwnerIsBanned,
      banInfoBanStatus,
    );
    const pagesCount = Math.ceil(
      totalCountPosts / queryData.queryPagination.pageSize,
    );
    return {
      pagesCount: pagesCount,
      page: queryData.queryPagination.pageNumber,
      pageSize: queryData.queryPagination.pageSize,
      totalCount: totalCountPosts,
      items: filledPosts,
    };
  }

  async findPosts(
    queryPagination: PaginationDto,
    searchFilters: QueryArrType,
    currentUserDto: CurrentUserDto | null,
  ): Promise<PaginationTypes> {
    const field = queryPagination.sortBy;
    const convertedFilters = await this.convertFiltersForDB.convert(
      searchFilters,
    );
    convertedFilters.push({ 'postOwnerInfo.isBanned': false });
    convertedFilters.push({ 'banInfo.isBanned': false });

    const pagination = await this.pagination.convert(queryPagination, field);
    const posts: PostsEntity[] = await this.postsRepository.findPosts(
      pagination,
      convertedFilters,
    );
    const filledPosts =
      await this.likeStatusPostsRepository.preparationPostsForReturn(
        posts,
        currentUserDto,
      );
    const totalCount = await this.postsRepository.countDocuments(
      convertedFilters,
    );
    const pagesCount = Math.ceil(totalCount / queryPagination.pageSize);
    return {
      pagesCount: pagesCount,
      page: queryPagination.pageNumber,
      pageSize: queryPagination.pageSize,
      totalCount: totalCount,
      items: filledPosts,
    };
  }

  async openFindPostById(
    searchFilters: QueryArrType,
    currentUserDto: CurrentUserDto | null,
  ): Promise<PostsReturnEntity | null> {
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

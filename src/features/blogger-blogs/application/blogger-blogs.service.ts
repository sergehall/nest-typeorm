import { Injectable, NotFoundException } from '@nestjs/common';
import { BloggerBlogsEntity } from '../entities/blogger-blogs.entity';
import { PaginationDto } from '../../common/pagination/dto/pagination.dto';
import { QueryArrType } from '../../common/convert-filters/types/convert-filter.types';
import { PaginationTypes } from '../../common/pagination/types/pagination.types';
import { ConvertFiltersForDB } from '../../common/convert-filters/convertFiltersForDB';
import { Pagination } from '../../common/pagination/pagination';
import { BloggerBlogsRepository } from '../infrastructure/blogger-blogs.repository';
import { CurrentUserDto } from '../../users/dto/currentUser.dto';

@Injectable()
export class BloggerBlogsService {
  constructor(
    protected convertFiltersForDB: ConvertFiltersForDB,
    protected pagination: Pagination,
    protected bloggerBlogsRepository: BloggerBlogsRepository,
  ) {}

  async openFindBlogs(
    queryPagination: PaginationDto,
    searchFilters: QueryArrType,
  ): Promise<PaginationTypes> {
    const field = queryPagination.sortBy;
    const convertedFilters = await this.convertFiltersForDB.convert(
      searchFilters,
    );
    convertedFilters.push({ 'blogOwnerInfo.isBanned': false });
    convertedFilters.push({ 'banInfo.isBanned': false });
    const pagination = await this.pagination.convert(queryPagination, field);
    const totalCount = await this.bloggerBlogsRepository.countDocuments(
      convertedFilters,
    );
    const pagesCount = Math.ceil(totalCount / queryPagination.pageSize);
    const blogs: BloggerBlogsEntity[] =
      await this.bloggerBlogsRepository.openFindBlogs(
        pagination,
        convertedFilters,
      );
    const pageNumber = queryPagination.pageNumber;
    const pageSize = pagination.pageSize;
    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: blogs,
    };
  }

  async openFindBlogById(blogId: string): Promise<BloggerBlogsEntity | null> {
    const searchFilters = [];
    searchFilters.push({ id: blogId });
    searchFilters.push({ 'blogOwnerInfo.isBanned': false });
    searchFilters.push({ 'banInfo.isBanned': false });
    return this.bloggerBlogsRepository.openFindBlogById(searchFilters);
  }

  async saFindBlogs(
    queryPagination: PaginationDto,
    searchFilters: QueryArrType,
  ): Promise<PaginationTypes> {
    const field = queryPagination.sortBy;
    const convertedFilters = await this.convertFiltersForDB.convert(
      searchFilters,
    );
    const pagination = await this.pagination.convert(queryPagination, field);
    const totalCount = await this.bloggerBlogsRepository.countDocuments(
      convertedFilters,
    );
    const pagesCount = Math.ceil(totalCount / queryPagination.pageSize);
    const blogs: BloggerBlogsEntity[] =
      await this.bloggerBlogsRepository.saFindBlogs(
        pagination,
        convertedFilters,
      );
    const pageNumber = queryPagination.pageNumber;
    const pageSize = pagination.pageSize;
    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: blogs,
    };
  }

  async findBlogsCurrentUser(
    queryPagination: PaginationDto,
    searchFilters: QueryArrType,
  ): Promise<PaginationTypes> {
    const field = queryPagination.sortBy;
    const convertedFilters = await this.convertFiltersForDB.convert(
      searchFilters,
    );
    const pagination = await this.pagination.convert(queryPagination, field);
    const totalCount = await this.bloggerBlogsRepository.countDocuments(
      convertedFilters,
    );
    const pagesCount = Math.ceil(totalCount / queryPagination.pageSize);
    const blogs: BloggerBlogsEntity[] =
      await this.bloggerBlogsRepository.findBlogsCurrentUser(
        pagination,
        convertedFilters,
      );
    const pageNumber = queryPagination.pageNumber;
    const pageSize = pagination.pageSize;
    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: blogs,
    };
  }

  async findBannedUsers(
    blogId: string,
    currentUser: CurrentUserDto,
    queryPagination: PaginationDto,
    searchFilters: QueryArrType,
  ): Promise<PaginationTypes> {
    const blog = await this.bloggerBlogsRepository.findBlogById(blogId);
    if (!blog) throw new NotFoundException();
    const field = queryPagination.sortBy;
    const pageNumber = queryPagination.pageNumber;
    const pageSize = queryPagination.pageSize;
    const convertedFilters = await this.convertFiltersForDB.convert(
      searchFilters,
    );
    const totalCount =
      await this.bloggerBlogsRepository.countBannedUsersDocuments(
        convertedFilters,
      );
    const pagesCount = Math.ceil(totalCount / pageSize);
    const pagination = await this.pagination.convert(queryPagination, field);
    const bannedUsers = await this.bloggerBlogsRepository.findBannedUsers(
      pagination,
      convertedFilters,
    );

    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: bannedUsers,
    };
  }
  async changeBanStatusOwnerBlog(
    userId: string,
    isBanned: boolean,
  ): Promise<boolean> {
    return await this.bloggerBlogsRepository.changeBanStatusOwnerBlog(
      userId,
      isBanned,
    );
  }
}

import { Injectable } from '@nestjs/common';
import { BloggerBlogsEntity } from '../entities/blogger-blogs.entity';
import { PaginationDto } from '../../infrastructure/common/pagination/dto/pagination.dto';
import { QueryArrType } from '../../infrastructure/common/convert-filters/types/convert-filter.types';
import { PaginationTypes } from '../../infrastructure/common/pagination/types/pagination.types';
import { ConvertFiltersForDB } from '../../infrastructure/common/convert-filters/convertFiltersForDB';
import { Pagination } from '../../infrastructure/common/pagination/pagination';
import { BloggerBlogsRepository } from '../infrastructure/blogger-blogs.repository';

@Injectable()
export class BloggerBlogsService {
  constructor(
    protected convertFiltersForDB: ConvertFiltersForDB,
    protected pagination: Pagination,
    private bloggerBlogsRepository: BloggerBlogsRepository,
  ) {}

  async findBlogs(
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
      await this.bloggerBlogsRepository.findBlogs(pagination, convertedFilters);
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

  async findBlogByIdForBlogs(id: string): Promise<BloggerBlogsEntity | null> {
    return this.bloggerBlogsRepository.findBlogByIdForBlogs(id);
  }
}

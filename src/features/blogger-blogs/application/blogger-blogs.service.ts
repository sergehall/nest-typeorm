import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BloggerBlogsEntity } from '../entities/blogger-blogs.entity';
import { PaginationDto } from '../../common/pagination/dto/pagination.dto';
import { QueryArrType } from '../../common/convert-filters/types/convert-filter.types';
import { PaginationTypes } from '../../common/pagination/types/pagination.types';
import { ConvertFiltersForDB } from '../../common/convert-filters/convertFiltersForDB';
import { Pagination } from '../../common/pagination/pagination';
import { BloggerBlogsRepository } from '../infrastructure/blogger-blogs.repository';
import { CurrentUserDto } from '../../users/dto/currentUser.dto';
import { ParseQueryType } from '../../common/parse-query/parse-query';
import { BloggerBlogsRawSqlRepository } from '../infrastructure/blogger-blogs-raw-sql.repository';
import { TableBloggerBlogsRawSqlEntity } from '../entities/table-blogger-blogs-raw-sql.entity';
import { ReturnBloggerBlogsEntity } from '../entities/return-blogger-blogs.entity';

@Injectable()
export class BloggerBlogsService {
  constructor(
    protected convertFiltersForDB: ConvertFiltersForDB,
    protected pagination: Pagination,
    protected bloggerBlogsRepository: BloggerBlogsRepository,
    protected bloggerBlogsRawSqlRepository: BloggerBlogsRawSqlRepository,
  ) {}

  async openFindBlogs(queryData: ParseQueryType): Promise<PaginationTypes> {
    const field = queryData.queryPagination.sortBy;
    const pagination = await this.pagination.convert(
      {
        pageNumber: queryData.queryPagination.pageNumber,
        pageSize: queryData.queryPagination.pageSize,
        sortBy: queryData.queryPagination.sortBy,
        sortDirection: queryData.queryPagination.sortDirection,
      },
      field,
    );
    const blogs: TableBloggerBlogsRawSqlEntity[] =
      await this.bloggerBlogsRawSqlRepository.openFindBlogs(
        pagination,
        queryData,
      );
    const transformedBlogs: ReturnBloggerBlogsEntity[] = blogs.map((i) => ({
      id: i.id,
      name: i.name,
      description: i.description,
      websiteUrl: i.websiteUrl,
      createdAt: i.createdAt,
      isMembership: i.isMembership,
    }));
    const totalCount = await this.bloggerBlogsRawSqlRepository.totalCountBlogs(
      pagination,
      queryData,
    );
    const pagesCount = Math.ceil(
      totalCount / queryData.queryPagination.pageSize,
    );
    return {
      pagesCount: pagesCount,
      page: queryData.queryPagination.pageNumber,
      pageSize: pagination.pageSize,
      totalCount: totalCount,
      items: transformedBlogs,
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
    const blogs: BloggerBlogsEntity[] =
      await this.bloggerBlogsRepository.saFindBlogs(
        pagination,
        convertedFilters,
      );
    const totalCount = await this.bloggerBlogsRepository.countDocuments(
      convertedFilters,
    );
    const pagesCount = Math.ceil(totalCount / queryPagination.pageSize);
    return {
      pagesCount: pagesCount,
      page: queryPagination.pageNumber,
      pageSize: pagination.pageSize,
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
    const blogs: BloggerBlogsEntity[] =
      await this.bloggerBlogsRepository.findBlogsCurrentUser(
        pagination,
        convertedFilters,
      );
    const totalCount = await this.bloggerBlogsRepository.countDocuments(
      convertedFilters,
    );
    const pagesCount = Math.ceil(totalCount / queryPagination.pageSize);
    return {
      pagesCount: pagesCount,
      page: queryPagination.pageNumber,
      pageSize: pagination.pageSize,
      totalCount: totalCount,
      items: blogs,
    };
  }

  async findBannedUsers(
    blogId: string,
    queryPagination: PaginationDto,
    searchFilters: QueryArrType,
    currentUser: CurrentUserDto,
  ): Promise<PaginationTypes> {
    const blog = await this.bloggerBlogsRepository.findBlogById(blogId);
    if (!blog) throw new NotFoundException();
    if (blog.blogOwnerInfo.userId !== currentUser.id)
      throw new ForbiddenException();
    const field = queryPagination.sortBy;
    const convertedFilters = await this.convertFiltersForDB.convert(
      searchFilters,
    );
    const pagination = await this.pagination.convert(queryPagination, field);
    const bannedUsers = await this.bloggerBlogsRepository.findBannedUsers(
      pagination,
      convertedFilters,
    );
    const totalCount =
      await this.bloggerBlogsRepository.countBannedUsersDocuments(
        convertedFilters,
      );
    const pagesCount = Math.ceil(totalCount / queryPagination.pageSize);

    return {
      pagesCount: pagesCount,
      page: queryPagination.pageNumber,
      pageSize: queryPagination.pageSize,
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

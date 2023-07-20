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
    const blogs: TableBloggerBlogsRawSqlEntity[] =
      await this.bloggerBlogsRawSqlRepository.openFindBlogs(queryData);

    const totalCount = await this.bloggerBlogsRawSqlRepository.totalCountBlogs(
      queryData,
    );
    const pagesCount = Math.ceil(
      totalCount / queryData.queryPagination.pageSize,
    );
    return {
      pagesCount: pagesCount,
      page: queryData.queryPagination.pageNumber,
      pageSize: queryData.queryPagination.pageSize,
      totalCount: totalCount,
      items: blogs,
    };
  }

  async openFindBlogById(blogId: string): Promise<ReturnBloggerBlogsEntity> {
    const blog = await this.bloggerBlogsRawSqlRepository.openFindBlogById(
      blogId,
    );
    if (!blog) {
      throw new NotFoundException();
    }
    return {
      id: blog.id,
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
    };
  }
  async findBlogById(blogId: string): Promise<TableBloggerBlogsRawSqlEntity> {
    console.log('findBlogById');
    const blog = await this.bloggerBlogsRawSqlRepository.findBlogById(blogId);
    console.log(blog, 'blog');
    if (!blog) {
      throw new NotFoundException();
    }
    return blog;
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
    currentUserDto: CurrentUserDto,
    queryData: ParseQueryType,
  ): Promise<PaginationTypes> {
    const blogs: TableBloggerBlogsRawSqlEntity[] =
      await this.bloggerBlogsRawSqlRepository.findBlogsCurrentUser(
        currentUserDto,
        queryData,
      );
    const totalCount =
      await this.bloggerBlogsRawSqlRepository.totalCountBlogsByUserId(
        currentUserDto.id,
      );
    const pagesCount = Math.ceil(
      totalCount / queryData.queryPagination.pageSize,
    );
    return {
      pagesCount: pagesCount,
      page: queryData.queryPagination.pageNumber,
      pageSize: queryData.queryPagination.pageSize,
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
  async removeBlogById(blogId: string): Promise<boolean> {
    return await this.bloggerBlogsRawSqlRepository.removeBlogById(blogId);
  }
}

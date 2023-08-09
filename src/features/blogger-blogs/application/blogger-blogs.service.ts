import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginationTypes } from '../../common/pagination/types/pagination.types';
import { CurrentUserDto } from '../../users/dto/currentUser.dto';
import { BloggerBlogsRawSqlRepository } from '../infrastructure/blogger-blogs-raw-sql.repository';
import { TableBloggerBlogsRawSqlEntity } from '../entities/table-blogger-blogs-raw-sql.entity';
import { ReturnBloggerBlogsEntity } from '../entities/return-blogger-blogs.entity';
import { ParseQueriesType } from '../../common/query/types/parse-query.types';
import { TablesBloggerBlogsTotalBlogs } from '../entities/tables-blogger-blogs-total-blogs';

@Injectable()
export class BloggerBlogsService {
  constructor(
    protected bloggerBlogsRawSqlRepository: BloggerBlogsRawSqlRepository,
  ) {}

  async openFindBlogs(queryData: ParseQueriesType): Promise<PaginationTypes> {
    const blogsTotalBlogs: TablesBloggerBlogsTotalBlogs[] =
      await this.bloggerBlogsRawSqlRepository.openFindBlogs(queryData);

    const blogs = blogsTotalBlogs.map((blog: TablesBloggerBlogsTotalBlogs) => ({
      id: blog.id,
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
    }));

    const totalCount = blogsTotalBlogs[0].totalBlogs;
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
    const blog = await this.bloggerBlogsRawSqlRepository.findBlogById(blogId);
    if (!blog) {
      throw new NotFoundException('Blog not found');
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
  async findBlogById(
    blogId: string,
  ): Promise<TableBloggerBlogsRawSqlEntity | null> {
    return await this.bloggerBlogsRawSqlRepository.findBlogById(blogId);
  }

  async saFindBlogs(queryData: ParseQueriesType): Promise<PaginationTypes> {
    const blogs: TableBloggerBlogsRawSqlEntity[] =
      await this.bloggerBlogsRawSqlRepository.saFindBlogs(queryData);

    const transformedArrBlogs = blogs.map(
      (blog: TableBloggerBlogsRawSqlEntity) => ({
        id: blog.id,
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
        createdAt: blog.createdAt,
        isMembership: blog.isMembership,
        blogOwnerInfo: {
          userId: blog.blogOwnerId,
          userLogin: blog.blogOwnerLogin,
        },
        banInfo: {
          isBanned: blog.banInfoIsBanned,
          banDate: blog.banInfoBanDate,
        },
      }),
    );
    const totalCount =
      await this.bloggerBlogsRawSqlRepository.saTotalCountBlogs(queryData);
    const pagesCount = Math.ceil(
      totalCount / queryData.queryPagination.pageSize,
    );
    return {
      pagesCount: pagesCount,
      page: queryData.queryPagination.pageNumber,
      pageSize: queryData.queryPagination.pageSize,
      totalCount: totalCount,
      items: transformedArrBlogs,
    };
  }

  async findBlogsCurrentUser(
    currentUserDto: CurrentUserDto,
    queryData: ParseQueriesType,
  ): Promise<PaginationTypes> {
    const { pageSize, pageNumber } = queryData.queryPagination;

    const blogs: TableBloggerBlogsRawSqlEntity[] =
      await this.bloggerBlogsRawSqlRepository.findBlogsCurrentUser(
        currentUserDto,
        queryData,
      );

    const totalCount: number =
      await this.bloggerBlogsRawSqlRepository.totalCountBlogsByUserId(
        currentUserDto.id,
        queryData,
      );

    const pagesCount: number = Math.ceil(totalCount / pageSize);
    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: blogs,
    };
  }
}

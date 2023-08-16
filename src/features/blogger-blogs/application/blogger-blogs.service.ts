import { Injectable } from '@nestjs/common';
import { BloggerBlogsRawSqlRepository } from '../infrastructure/blogger-blogs-raw-sql.repository';
import { TableBloggerBlogsRawSqlEntity } from '../entities/table-blogger-blogs-raw-sql.entity';

@Injectable()
export class BloggerBlogsService {
  constructor(
    protected bloggerBlogsRawSqlRepository: BloggerBlogsRawSqlRepository,
  ) {}

  async findBlogById(
    blogId: string,
  ): Promise<TableBloggerBlogsRawSqlEntity | null> {
    return await this.bloggerBlogsRawSqlRepository.findBlogById(blogId);
  }
}

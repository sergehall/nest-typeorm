import { Injectable, PipeTransform, NotFoundException } from '@nestjs/common';
import { BloggerBlogsRawSqlRepository } from '../features/blogger-blogs/infrastructure/blogger-blogs-raw-sql.repository';
import { TableBloggerBlogsRawSqlEntity } from '../features/blogger-blogs/entities/table-blogger-blogs-raw-sql.entity';

@Injectable()
export class BlogExistNotFoundRule implements PipeTransform {
  constructor(
    private bloggerBlogsRawSqlRepository: BloggerBlogsRawSqlRepository,
  ) {}

  async transform(value: string): Promise<TableBloggerBlogsRawSqlEntity> {
    const blog: TableBloggerBlogsRawSqlEntity | null =
      await this.bloggerBlogsRawSqlRepository.findBlogById(value);
    if (!blog) {
      throw new NotFoundException(`Blog with id ${value} not found`);
    }

    return blog;
  }
}

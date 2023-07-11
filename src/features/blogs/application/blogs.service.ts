import { Injectable } from '@nestjs/common';
import { BloggerBlogsEntity } from '../../blogger-blogs/entities/blogger-blogs.entity';
import { BloggerBlogsService } from '../../blogger-blogs/application/blogger-blogs.service';
import { PaginationTypes } from '../../common/pagination/types/pagination.types';
import { ParseQueryType } from '../../common/parse-query/parse-query';

@Injectable()
export class BlogsService {
  constructor(protected bloggerBlogsService: BloggerBlogsService) {}
  async openFindBlogById(blogId: string): Promise<BloggerBlogsEntity | null> {
    return await this.bloggerBlogsService.openFindBlogById(blogId);
  }
  async openFindBlogs(queryData: ParseQueryType): Promise<PaginationTypes> {
    return await this.bloggerBlogsService.openFindBlogs(queryData);
  }
}

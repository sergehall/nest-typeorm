import { Injectable } from '@nestjs/common';
import { BloggerBlogsService } from '../../blogger-blogs/application/blogger-blogs.service';
import { ReturnBloggerBlogsEntity } from '../../blogger-blogs/entities/return-blogger-blogs.entity';
import { ParseQueriesDto } from '../../../common/query/dto/parse-queries.dto';
import { PaginatedResultDto } from '../../../common/pagination/dto/paginated-result.dto';

@Injectable()
export class BlogsService {
  constructor(protected bloggerBlogsService: BloggerBlogsService) {}
  async openFindBlogById(blogId: string): Promise<ReturnBloggerBlogsEntity> {
    return await this.bloggerBlogsService.openFindBlogById(blogId);
  }

  async openFindBlogs(queryData: ParseQueriesDto): Promise<PaginatedResultDto> {
    return await this.bloggerBlogsService.openFindBlogs(queryData);
  }
}

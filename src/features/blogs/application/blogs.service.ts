import { Injectable } from '@nestjs/common';
import { BloggerBlogsService } from '../../blogger-blogs/application/blogger-blogs.service';
import { ReturnBloggerBlogsEntity } from '../../blogger-blogs/entities/return-blogger-blogs.entity';

@Injectable()
export class BlogsService {
  constructor(protected bloggerBlogsService: BloggerBlogsService) {}
  async openFindBlogById(blogId: string): Promise<ReturnBloggerBlogsEntity> {
    return await this.bloggerBlogsService.openFindBlogById(blogId);
  }
}

import { Injectable } from '@nestjs/common';
import { BloggerBlogsEntity } from '../blogger-blogs/entities/blogger-blogs.entity';
import { BloggerBlogsService } from '../blogger-blogs/blogger-blogs.service';

@Injectable()
export class BlogsService {
  constructor(protected bloggerBlogsService: BloggerBlogsService) {}
  async findBlogs(id: string): Promise<BloggerBlogsEntity | null> {
    return await this.bloggerBlogsService.findBlogById(id);
  }
}

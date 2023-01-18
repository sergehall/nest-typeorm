import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { SkipThrottle } from '@nestjs/throttler';
import { BloggerBlogsEntity } from '../blogger-blogs/entities/blogger-blogs.entity';

@SkipThrottle()
@Controller('blogs')
export class BlogsController {
  constructor(protected blogsService: BlogsService) {}

  @Get(':id')
  async findBlogs(@Param('id') id: string): Promise<BloggerBlogsEntity | null> {
    const blog = await this.blogsService.findBlogs(id);
    if (!blog) {
      throw new NotFoundException();
    }
    return blog;
  }
}

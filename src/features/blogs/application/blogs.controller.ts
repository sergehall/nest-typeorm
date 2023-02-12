import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { SkipThrottle } from '@nestjs/throttler';
import { BloggerBlogsEntity } from '../../blogger-blogs/entities/blogger-blogs.entity';
import { IdParams } from '../../common/params/id.params';

@SkipThrottle()
@Controller('blogs')
export class BlogsController {
  constructor(protected blogsService: BlogsService) {}

  @Get(':id')
  async findBlogs(
    @Param() params: IdParams,
  ): Promise<BloggerBlogsEntity | null> {
    console.log('------------BlogsController--findBlogs------------------');
    console.log('-----------------', params.id, '--------------');
    console.log('--------------------------------');
    const blog = await this.blogsService.findBlogs(params.id);
    if (!blog) {
      throw new NotFoundException();
    }
    return blog;
  }
}

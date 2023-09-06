import { Injectable, PipeTransform, NotFoundException } from '@nestjs/common';
import { BloggerBlogsRepo } from '../../features/blogger-blogs/infrastructure/blogger-blogs.repo';
import { BloggerBlogsEntity } from '../../features/blogger-blogs/entities/blogger-blogs.entity';

@Injectable()
export class BlogExistValidationPipe implements PipeTransform {
  constructor(private bloggerBlogsRepo: BloggerBlogsRepo) {}

  async transform(value: string): Promise<string> {
    const blog: BloggerBlogsEntity | null =
      await this.bloggerBlogsRepo.findBlogById(value);
    if (!blog) {
      throw new NotFoundException(`Blog with id: ${value} not found`);
    }
    return value;
  }
}

import { Injectable } from '@nestjs/common';
import { BloggerBlogsEntity } from '../entities/blogger-blogs.entity';
import { BloggerBlogsViewModel } from '../view-models/blogger-blogs.view-model';

@Injectable()
export class BloggerBlogsService {
  async transformedBlogs(
    blogsArr: BloggerBlogsEntity[],
  ): Promise<BloggerBlogsViewModel[]> {
    return blogsArr.map((row: BloggerBlogsEntity) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      websiteUrl: row.websiteUrl,
      createdAt: row.createdAt,
      isMembership: row.isMembership,
    }));
  }
}

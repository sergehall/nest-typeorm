import { Injectable } from '@nestjs/common';
import { BloggerBlogsEntity } from '../entities/blogger-blogs.entity';
import { BloggerBlogsViewModel } from '../view-models/blogger-blogs.view-model';
import { SaBloggerBlogsViewModel } from '../../sa/view-models/sa-blogger-blogs.view-model';

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

  async transformBlogsForSa(
    blogs: BloggerBlogsEntity[],
  ): Promise<SaBloggerBlogsViewModel[]> {
    return blogs.map((blog: BloggerBlogsEntity) => ({
      id: blog.id,
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
      blogOwnerInfo: {
        userId: blog.blogOwner.userId,
        userLogin: blog.blogOwner.login,
      },
      banInfo: {
        isBanned: blog.isBanned,
        banDate: blog.banDate,
      },
    }));
  }
}

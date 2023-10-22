import { Injectable } from '@nestjs/common';
import { SaBloggerBlogsViewModel } from '../view-models/sa-blogger-blogs.view-model';
import { BloggerBlogsEntity } from '../../blogger-blogs/entities/blogger-blogs.entity';
@Injectable()
export class SaService {
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
    }));
  }

  async transformBlogs(
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
        isBanned: blog.banInfoIsBanned,
        banDate: blog.banInfoBanDate,
      },
    }));
  }
}

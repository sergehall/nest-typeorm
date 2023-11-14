import { Injectable } from '@nestjs/common';
import { BloggerBlogsEntity } from '../../blogger-blogs/entities/blogger-blogs.entity';
import { SaBloggerBlogsViewModel } from '../views/sa-blogger-blogs.view-model';

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
      banInfo: {
        isBanned: blog.isBanned,
        banDate: blog.banDate,
      },
    }));
  }
}

import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { BloggerBlogsRawSqlEntity } from '../entities/blogger-blogs-raw-sql.entity';

export class BloggerBlogsRawSqlRepository {
  constructor(@InjectDataSource() private readonly db: DataSource) {}

  async findBlogById(blogId: string): Promise<BloggerBlogsRawSqlEntity | null> {
    try {
      const blog = await this.db.query(
        `
      SELECT "id", "createdAt", "isMembership", 
      "blogOwnerId", "blogOwnerLogin", "blogOwnerBanStatus", 
      "banInfoBanStatus", "banInfoBanDate", "banInfoBanReason", 
      "name", "description", "websiteUrl"
      FROM public."BloggerBlogs"
      WHERE "id" = $1`,
        [blogId],
      );
      return blog[0] ? blog[0] : null;
    } catch (error) {
      throw new ForbiddenException(error.message);
    }
  }
  async isBannedUserForBlog(
    blogOwnerId: string,
    blogId: string,
  ): Promise<boolean> {
    try {
      const blog: BloggerBlogsRawSqlEntity[] = await this.db.query(
        `
      SELECT "id", "createdAt", "isMembership", 
        "blogOwnerId", "blogOwnerLogin", "blogOwnerBanStatus", 
        "banInfoBanStatus", "banInfoBanDate", "banInfoBanReason", 
        "name", "description", "websiteUrl"
      FROM public."BloggerBlogs"
      WHERE "id" = $1 AND "blogOwnerId" = $2 AND "banInfoBanStatus" = true`,
        [blogId, blogOwnerId],
      );
      return blog.length !== 0;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async createBlogs(
    bloggerBlogsRawSqlEntity: BloggerBlogsRawSqlEntity,
  ): Promise<BloggerBlogsRawSqlEntity> {
    try {
      const createNewBlog = await this.db.query(
        `
        INSERT INTO public."BloggerBlogs"(
        "id", "createdAt", "isMembership", 
        "blogOwnerId", "blogOwnerLogin", "blogOwnerBanStatus", 
        "banInfoBanStatus", "banInfoBanDate", "banInfoBanReason", 
        "name",  "description", "websiteUrl")
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          returning "id", "name", "description", "websiteUrl", "createdAt", "isMembership"`,
        [
          bloggerBlogsRawSqlEntity.id,
          bloggerBlogsRawSqlEntity.createdAt,
          bloggerBlogsRawSqlEntity.isMembership,
          bloggerBlogsRawSqlEntity.blogOwnerId,
          bloggerBlogsRawSqlEntity.blogOwnerLogin,
          bloggerBlogsRawSqlEntity.blogOwnerBanStatus,
          bloggerBlogsRawSqlEntity.banInfoBanStatus,
          bloggerBlogsRawSqlEntity.banInfoBanDate,
          bloggerBlogsRawSqlEntity.banInfoBanReason,
          bloggerBlogsRawSqlEntity.name,
          bloggerBlogsRawSqlEntity.description,
          bloggerBlogsRawSqlEntity.websiteUrl,
        ],
      );
      return createNewBlog[0];
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }
}

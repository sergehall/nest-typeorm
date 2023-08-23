import { InjectRepository } from '@nestjs/typeorm';
import { InsertResult, Repository } from 'typeorm';
import { BloggerBlogsEntity } from '../entities/blogger-blogs.entity';
import { InternalServerErrorException } from '@nestjs/common';
import { CreateBloggerBlogsDto } from '../dto/create-blogger-blogs.dto';
import { CurrentUserDto } from '../../users/dto/currentUser.dto';
import * as uuid4 from 'uuid4';
import { UsersEntity } from '../../users/entities/users.entity';

export class BloggerBlogsRepo {
  constructor(
    @InjectRepository(BloggerBlogsEntity)
    private readonly bloggerBlogsRepository: Repository<BloggerBlogsEntity>,
  ) {}

  async createBlogs(
    createBloggerBlogsDto: CreateBloggerBlogsDto,
    currentUser: CurrentUserDto,
  ): Promise<BloggerBlogsEntity> {
    const blogEntity: BloggerBlogsEntity = await this.createBlogsEntity(
      createBloggerBlogsDto,
      currentUser,
    );

    try {
      const queryBuilder = this.bloggerBlogsRepository
        .createQueryBuilder()
        .insert()
        .into(BloggerBlogsEntity)
        .values(blogEntity)
        .returning(
          `"id", "name", "description", "websiteUrl", "createdAt", "isMembership"`,
        );

      const result: InsertResult = await queryBuilder.execute();

      return result.raw[0];
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(
        'An error occurred while creating a new blog.',
      );
    }
  }

  private async createBlogsEntity(
    dto: CreateBloggerBlogsDto,
    currentUser: CurrentUserDto,
  ): Promise<BloggerBlogsEntity> {
    const { userId, login, isBanned } = currentUser;
    const { name, description, websiteUrl } = dto;

    const user = new UsersEntity();
    user.userId = userId;

    const newBlog = new BloggerBlogsEntity();
    newBlog.id = uuid4();
    newBlog.name = name;
    newBlog.description = description;
    newBlog.websiteUrl = websiteUrl;
    newBlog.createdAt = new Date().toISOString();
    newBlog.isMembership = false;
    newBlog.blogOwnerLogin = login;
    newBlog.dependencyIsBanned = isBanned;
    newBlog.banInfoIsBanned = false;
    newBlog.banInfoBanDate = null;
    newBlog.banInfoBanReason = null;
    newBlog.blogOwnerId = user;

    return newBlog;
  }
}

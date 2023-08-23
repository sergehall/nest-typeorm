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
    const blogEntity: BloggerBlogsEntity = await this.createTablesBlogsEntity(
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

  private async createTablesBlogsEntity(
    dto: CreateBloggerBlogsDto,
    currentUser: CurrentUserDto,
  ): Promise<BloggerBlogsEntity> {
    const { userId, login, isBanned } = currentUser;

    const user = new UsersEntity();
    user.userId = userId;

    return {
      ...dto,
      id: uuid4(),
      createdAt: new Date().toISOString(),
      isMembership: false,
      blogOwnerLogin: login,
      dependencyIsBanned: isBanned,
      banInfoIsBanned: false,
      banInfoBanDate: null,
      banInfoBanReason: null,
      blogOwnerId: user,
      comments: [],
    };
  }
}

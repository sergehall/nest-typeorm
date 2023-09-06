import { InjectRepository } from '@nestjs/typeorm';
import { InsertResult, Repository } from 'typeorm';
import { BloggerBlogsEntity } from '../entities/blogger-blogs.entity';
import { InternalServerErrorException } from '@nestjs/common';
import { CreateBlogsDto } from '../dto/create-blogs.dto';
import { CurrentUserDto } from '../../users/dto/currentUser.dto';
import * as uuid4 from 'uuid4';
import { UsersEntity } from '../../users/entities/users.entity';

export class BloggerBlogsRepo {
  constructor(
    @InjectRepository(BloggerBlogsEntity)
    private readonly bloggerBlogsRepository: Repository<BloggerBlogsEntity>,
  ) {}

  async findBlogById(blogId: string): Promise<BloggerBlogsEntity | null> {
    const dependencyIsBanned = false;
    const banInfoIsBanned = false;

    const blog = await this.bloggerBlogsRepository
      .createQueryBuilder('blog') // Start building a query
      .leftJoinAndSelect('blog.blogOwner', 'blogOwner') // Eager load the blogOwner relationship
      .where('blog.id = :blogId', { blogId })
      .andWhere('blog.dependencyIsBanned = :dependencyIsBanned', {
        dependencyIsBanned,
      })
      .andWhere('blog.banInfoIsBanned = :banInfoIsBanned', { banInfoIsBanned })
      .getOne(); // Execute the query and get a single result

    return blog || null; // Return the retrieved blog with its associated blogOwner
  }

  async createBlogs(
    createBloggerBlogsDto: CreateBlogsDto,
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

  async updateBlogById(
    id: string,
    updateBlogDto: CreateBlogsDto,
  ): Promise<boolean> {
    try {
      const { name, description, websiteUrl } = updateBlogDto;

      const result = await this.bloggerBlogsRepository.update(id, {
        name,
        description,
        websiteUrl,
      });

      return result.affected === 1;
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  private async createBlogsEntity(
    dto: CreateBlogsDto,
    currentUser: CurrentUserDto,
  ): Promise<BloggerBlogsEntity> {
    const { userId, login, isBanned } = currentUser;
    const { name, description, websiteUrl } = dto;

    const user = new UsersEntity();
    user.userId = userId;
    user.login = login;

    const newBlog = new BloggerBlogsEntity();
    newBlog.id = uuid4();
    newBlog.name = name;
    newBlog.description = description;
    newBlog.websiteUrl = websiteUrl;
    newBlog.createdAt = new Date().toISOString();
    newBlog.isMembership = false;
    newBlog.dependencyIsBanned = isBanned;
    newBlog.banInfoIsBanned = false;
    newBlog.banInfoBanDate = null;
    newBlog.banInfoBanReason = null;
    newBlog.blogOwner = user;

    return newBlog;
  }
}

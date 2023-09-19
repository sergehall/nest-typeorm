import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, InsertResult, Repository } from 'typeorm';
import { BloggerBlogsEntity } from '../entities/blogger-blogs.entity';
import { InternalServerErrorException } from '@nestjs/common';
import { CreateBlogsDto } from '../dto/create-blogs.dto';
import { CurrentUserDto } from '../../users/dto/currentUser.dto';
import * as uuid4 from 'uuid4';
import { UsersEntity } from '../../users/entities/users.entity';
import { ParseQueriesDto } from '../../../common/query/dto/parse-queries.dto';
import { KeyResolver } from '../../../common/helpers/key-resolver';
import { BlogsCountBlogsDto } from '../dto/blogs-count-blogs.dto';

export class BloggerBlogsRepo {
  constructor(
    @InjectRepository(BloggerBlogsEntity)
    private readonly bloggerBlogsRepository: Repository<BloggerBlogsEntity>,
    protected keyResolver: KeyResolver,
  ) {}

  async searchBlogsForSa(
    queryData: ParseQueriesDto,
  ): Promise<BlogsCountBlogsDto> {
    try {
      const searchNameTerm = queryData.searchNameTerm;
      const sortBy = await this.getSortBy(queryData.queryPagination.sortBy);
      const direction = queryData.queryPagination.sortDirection;
      const limit = queryData.queryPagination.pageSize;
      const offset = (queryData.queryPagination.pageNumber - 1) * limit;

      const collate = direction === 'ASC' ? `NULLS FIRST` : `NULLS LAST`;

      const queryBuilder = this.bloggerBlogsRepository
        .createQueryBuilder('blog')
        .select([
          'blog.id',
          'blog.name',
          'blog.description',
          'blog.websiteUrl',
          'blog.createdAt',
          'blog.isMembership',
          'blog.blogOwnerId',
          'blog.blogOwnerLogin',
          'blog.banInfoIsBanned',
          'blog.banInfoBanDate',
        ])
        .leftJoinAndSelect('blog.blogOwner', 'blogOwner')
        .where('blog.name ILIKE :searchNameTerm', {
          searchNameTerm: searchNameTerm,
        })
        .orderBy(`blog.${sortBy}`, direction, collate);

      const blogs: BloggerBlogsEntity[] = await queryBuilder
        .skip(offset)
        .take(limit)
        .getMany();

      const countBlogs = await queryBuilder.getCount();

      if (blogs.length === 0) {
        return {
          blogs: [],
          countBlogs: countBlogs,
        };
      }

      return { blogs: blogs, countBlogs: countBlogs };
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

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

  async saDeleteBlogDataById(id: string): Promise<boolean> {
    try {
      await this.bloggerBlogsRepository.manager.transaction(
        async (transactionalEntityManager) => {
          await this.deleteBlogData(id, transactionalEntityManager);
        },
      );
      return true;
    } catch (error) {
      console.error(`Error while removing data for blog: ${error.message}`);
      throw new Error(`Error while removing data for blog`);
    }
  }

  private async deleteBlogData(
    id: string,
    entityManager: EntityManager,
  ): Promise<void> {
    try {
      await Promise.all([
        entityManager.delete('BannedUsersForBlogs', {
          bannedBlog: id,
        }),
        entityManager.delete('LikeStatusComments', {
          blog: id,
        }),
        entityManager.delete('LikeStatusPosts', { blog: id }),
      ]);
      await entityManager
        .createQueryBuilder()
        .delete()
        .from('Comments')
        .where('blogId = :id', { id })
        .execute();
      await entityManager
        .createQueryBuilder()
        .delete()
        .from('Posts')
        .where('blogId = :id', { id })
        .execute();
      await entityManager.delete('BloggerBlogs', { id });
    } catch (error) {
      console.error(
        `Error while removing data for user ${id}: ${error.message}`,
      );
      throw new Error(`Error while removing data for user ${id}`);
    }
  }

  async getSortBy(sortBy: string): Promise<string> {
    return await this.keyResolver.resolveKey(
      sortBy,
      [
        'isMembership',
        'blogLogin',
        'dependencyIsBanned',
        'banInfoIsBanned',
        'banInfoBanDate',
        'banInfoBanReason',
        'name',
        'description',
        'websiteUrl',
      ],
      'createdAt',
    );
  }
}

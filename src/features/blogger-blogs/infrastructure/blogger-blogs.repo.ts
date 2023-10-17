import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, InsertResult, Repository } from 'typeorm';
import { BloggerBlogsEntity } from '../entities/blogger-blogs.entity';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateBlogsDto } from '../dto/create-blogs.dto';
import { CurrentUserDto } from '../../users/dto/currentUser.dto';
import * as uuid4 from 'uuid4';
import { UsersEntity } from '../../users/entities/users.entity';
import { ParseQueriesDto } from '../../../common/query/dto/parse-queries.dto';
import { KeyResolver } from '../../../common/helpers/key-resolver';
import { BlogsCountBlogsDto } from '../dto/blogs-count-blogs.dto';
import { UuidErrorResolver } from '../../../common/helpers/uuid-error-resolver';
import { BannedUsersForBlogsEntity } from '../../users/entities/banned-users-for-blogs.entity';
import { LikeStatusPostsEntity } from '../../posts/entities/like-status-posts.entity';
import { LikeStatusCommentsEntity } from '../../comments/entities/like-status-comments.entity';
import { CommentsEntity } from '../../comments/entities/comments.entity';

export class BloggerBlogsRepo {
  constructor(
    @InjectRepository(BloggerBlogsEntity)
    private readonly bloggerBlogsRepository: Repository<BloggerBlogsEntity>,
    protected keyResolver: KeyResolver,
    protected uuidErrorResolver: UuidErrorResolver,
  ) {}

  async getBlogsOpenApi(
    queryData: ParseQueriesDto,
  ): Promise<BlogsCountBlogsDto> {
    const blogOwnerBanStatus = false;
    const banInfoBanStatus = false;
    const searchNameTerm = queryData.searchNameTerm;
    const sortBy = await this.getSortBy(queryData.queryPagination.sortBy);
    const direction = queryData.queryPagination.sortDirection;
    const limit = queryData.queryPagination.pageSize;
    const offset = (queryData.queryPagination.pageNumber - 1) * limit;

    const collate = direction === 'ASC' ? `NULLS FIRST` : `NULLS LAST`;

    const queryBuilder = this.bloggerBlogsRepository
      .createQueryBuilder('blogs')
      .select([
        'blogs.id',
        'blogs.name',
        'blogs.description',
        'blogs.websiteUrl',
        'blogs.createdAt',
        'blogs.isMembership',
      ])
      .where('"dependencyIsBanned" = :dependencyIsBanned', {
        dependencyIsBanned: blogOwnerBanStatus,
      })
      .andWhere('"banInfoIsBanned" = :banInfoIsBanned', {
        banInfoIsBanned: banInfoBanStatus,
      })
      .andWhere('blogs.name ILIKE :searchNameTerm', { searchNameTerm });

    try {
      const countBlogs = await queryBuilder.getCount();

      queryBuilder.orderBy(`blogs.${sortBy}`, direction, collate);
      queryBuilder.limit(limit);
      queryBuilder.offset(offset);

      const blogs: BloggerBlogsEntity[] = await queryBuilder.getMany();

      return { blogs, countBlogs };
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async getUserBlogs(
    currentUserDto: CurrentUserDto,
    queryData: ParseQueriesDto,
  ): Promise<BlogsCountBlogsDto> {
    const blogOwnerBanStatus = false;
    const banInfoBanStatus = false;
    const { userId } = currentUserDto;
    const searchNameTerm = queryData.searchNameTerm;
    const sortBy = await this.getSortBy(queryData.queryPagination.sortBy);
    const direction = queryData.queryPagination.sortDirection;
    const limit = queryData.queryPagination.pageSize;
    const offset = (queryData.queryPagination.pageNumber - 1) * limit;

    const queryBuilder = this.bloggerBlogsRepository
      .createQueryBuilder('Blogs')
      .select([
        'id',
        'name',
        'description',
        'websiteUrl',
        'createdAt',
        'isMembership',
      ])
      .addSelect('(COUNT(*) OVER())', 'countBlogs')
      .where('"dependencyIsBanned" = :dependencyIsBanned', {
        dependencyIsBanned: blogOwnerBanStatus,
      })
      .andWhere('"banInfoIsBanned" = :banInfoIsBanned', {
        banInfoIsBanned: banInfoBanStatus,
      })
      .andWhere('"blogOwnerId" = :blogOwnerId', { blogOwnerId: userId })
      .andWhere('"name" ILIKE :searchNameTerm', { searchNameTerm })
      .orderBy(`"${sortBy}"`, direction);

    try {
      const countBlogs = await queryBuilder.getCount();

      queryBuilder.limit(limit);
      queryBuilder.offset(offset);

      const blogs: BloggerBlogsEntity[] = await queryBuilder.getMany();

      return { blogs, countBlogs };
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

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

    const queryBuilder = this.bloggerBlogsRepository
      .createQueryBuilder('blog') // Start building a query
      .leftJoinAndSelect('blog.blogOwner', 'blogOwner') // Eager load the blogOwner relationship
      .where('blog.id = :blogId', { blogId })
      .andWhere('blog.dependencyIsBanned = :dependencyIsBanned', {
        dependencyIsBanned,
      })
      .andWhere('blog.banInfoIsBanned = :banInfoIsBanned', { banInfoIsBanned });

    try {
      const blog = await queryBuilder.getOne(); // Execute the query and get a single result

      return blog || null; // Return the retrieved blog with its associated blogOwner
    } catch (error) {
      if (await this.uuidErrorResolver.isInvalidUUIDError(error)) {
        const userId = await this.uuidErrorResolver.extractUserIdFromError(
          error,
        );
        throw new NotFoundException(`Post with ID ${userId} not found`);
      }
      throw new InternalServerErrorException(error.message);
    }
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

  async manageBlogAccess(
    bannedUserForBlogEntity: BannedUsersForBlogsEntity,
  ): Promise<boolean> {
    const connection = this.bloggerBlogsRepository.manager.connection;
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();

    const userId = bannedUserForBlogEntity.bannedUserForBlogs.userId;
    const blogId = bannedUserForBlogEntity.bannedBlog.id;

    try {
      await queryRunner.startTransaction();

      await connection.manager.update(
        LikeStatusPostsEntity,
        {
          ratedPostUser: userId,
          blog: blogId,
        },
        { isBanned: bannedUserForBlogEntity.isBanned },
      );

      // Update LikeStatusComments table
      await connection.manager.update(
        LikeStatusCommentsEntity,
        [
          {
            ratedCommentUser: userId,
            blog: blogId,
          },
          {
            commentOwner: userId,
            blog: blogId,
          },
        ],
        { isBanned: bannedUserForBlogEntity.isBanned },
      );

      // Update Comments table
      await connection.manager.update(
        CommentsEntity,
        {
          commentator: userId,
          blog: blogId,
        },
        {
          isBanned: bannedUserForBlogEntity.isBanned,
          banDate: bannedUserForBlogEntity.banDate,
          banReason: bannedUserForBlogEntity.banReason,
        },
      );

      if (bannedUserForBlogEntity.isBanned) {
        // Insert if banned
        await connection.manager.save(
          BannedUsersForBlogsEntity,
          bannedUserForBlogEntity,
        );
        await queryRunner.commitTransaction();
      } else {
        // Delete record from BannedUsersForBlogs if unBan user
        await connection.manager.delete(BannedUsersForBlogsEntity, {
          bannedUserForBlogs: userId,
          bannedBlog: blogId,
        });
        await queryRunner.commitTransaction();
      }

      if (bannedUserForBlogEntity.isBanned) {
        // Successful User Ban Message
        console.log(
          `User ${userId} has been blocked from accessing Blog ${blogId}. 🚫`,
        );
      } else {
        // Successful User unBan Message
        console.log(
          `User with ID ${userId} has been unbanned for the blog with ID ${blogId} 🚪`,
        );
      }
      return true;
    } catch (error) {
      console.log('rollbackTransaction');
      console.error(
        `Error occurred while banning user ${userId} for blog ${blogId}:`,
        error,
      );
      await queryRunner.rollbackTransaction();
      return false;
    } finally {
      await queryRunner.release();
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

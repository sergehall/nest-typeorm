import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, InsertResult, Repository } from 'typeorm';
import { BloggerBlogsEntity } from '../entities/blogger-blogs.entity';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateBlogsDto } from '../dto/create-blogs.dto';
import { CurrentUserDto } from '../../users/dto/current-user.dto';
import { UsersEntity } from '../../users/entities/users.entity';
import { ParseQueriesDto } from '../../../common/query/dto/parse-queries.dto';
import { KeyResolver } from '../../../common/helpers/key-resolver';
import { BlogsCountBlogsDto } from '../dto/blogs-count-blogs.dto';
import { UuidErrorResolver } from '../../../common/helpers/uuid-error-resolver';
import { BannedUsersForBlogsEntity } from '../../users/entities/banned-users-for-blogs.entity';
import { LikeStatusPostsEntity } from '../../posts/entities/like-status-posts.entity';
import { LikeStatusCommentsEntity } from '../../comments/entities/like-status-comments.entity';
import { CommentsEntity } from '../../comments/entities/comments.entity';
import { PostsEntity } from '../../posts/entities/posts.entity';
import { SaBanBlogDto } from '../../sa/dto/sa-ban-blog.dto';

export class BloggerBlogsRepo {
  constructor(
    @InjectRepository(BloggerBlogsEntity)
    private readonly bloggerBlogsRepository: Repository<BloggerBlogsEntity>,
    private readonly keyResolver: KeyResolver,
    private readonly uuidErrorResolver: UuidErrorResolver,
  ) {}

  async getBlogsPublic(
    queryData: ParseQueriesDto,
  ): Promise<BlogsCountBlogsDto> {
    const blogOwnerBanStatus = false;
    const banInfoBanStatus = false;

    const searchNameTerm = queryData.searchNameTerm;
    const sortBy = await this.getSortBy(queryData.queryPagination.sortBy);
    const direction = queryData.queryPagination.sortDirection;
    const limit = queryData.queryPagination.pageSize;
    const offset = (queryData.queryPagination.pageNumber - 1) * limit;

    const nullsDirection = direction === 'ASC' ? `NULLS FIRST` : `NULLS LAST`;

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
      .andWhere('blogs.name ILIKE :searchNameTerm', { searchNameTerm })
      .orderBy(`blogs.${sortBy} COLLATE "C"`, direction, nullsDirection);

    try {
      const countBlogs: number = await queryBuilder.getCount();

      const blogs: BloggerBlogsEntity[] = await queryBuilder
        .offset(offset)
        .limit(limit)
        .getMany();

      return { blogs, countBlogs };
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async getBlogsOwnedByCurrentUser(
    currentUserDto: CurrentUserDto,
    queryData: ParseQueriesDto,
  ): Promise<BlogsCountBlogsDto> {
    const { userId } = currentUserDto;
    // ban flags should be false
    const dependencyIsBanned = false;
    const banInfoIsBanned = false;

    const searchNameTerm = queryData.searchNameTerm;
    const sortBy = await this.getSortBy(queryData.queryPagination.sortBy);
    const direction = queryData.queryPagination.sortDirection;
    const limit = queryData.queryPagination.pageSize;
    const offset = (queryData.queryPagination.pageNumber - 1) * limit;
    const nullsDirection = direction === 'ASC' ? `NULLS FIRST` : `NULLS LAST`;

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
      .leftJoinAndSelect('blogs.blogOwner', 'blogOwner')
      .where('blogOwner.userId = :userId', { userId })
      .andWhere('blogs.name ILIKE :searchNameTerm', { searchNameTerm })
      .andWhere('blogs.dependencyIsBanned = :dependencyIsBanned', {
        dependencyIsBanned,
      })
      .andWhere('blogs.banInfoIsBanned = :banInfoIsBanned', {
        banInfoIsBanned,
      })
      .orderBy(`blogs.${sortBy} COLLATE "C"`, direction, nullsDirection);

    try {
      const countBlogs = await queryBuilder.getCount();

      const blogs: BloggerBlogsEntity[] = await queryBuilder
        .offset(offset)
        .limit(limit)
        .getMany();

      return { blogs, countBlogs };
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async getBlogsSa(queryData: ParseQueriesDto): Promise<BlogsCountBlogsDto> {
    const searchNameTerm = queryData.searchNameTerm;
    const sortBy = await this.getSortBy(queryData.queryPagination.sortBy);
    const direction = queryData.queryPagination.sortDirection;
    const limit = queryData.queryPagination.pageSize;
    const offset = (queryData.queryPagination.pageNumber - 1) * limit;

    const nullsDirection = direction === 'ASC' ? `NULLS FIRST` : `NULLS LAST`;

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
      .leftJoinAndSelect('blogs.blogOwner', 'blogOwner')
      .where('blogs.name ILIKE :searchNameTerm', {
        searchNameTerm,
      })
      .orderBy(`blogs.${sortBy} COLLATE "C"`, direction, nullsDirection);

    try {
      const countBlogs: number = await queryBuilder.getCount();

      const blogs: BloggerBlogsEntity[] = await queryBuilder
        .offset(offset)
        .limit(limit)
        .getMany();

      if (blogs.length === 0) {
        return {
          blogs: [],
          countBlogs: countBlogs,
        };
      }

      return { blogs, countBlogs };
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async findBlogById(blogId: string): Promise<BloggerBlogsEntity | null> {
    const queryBuilder = this.bloggerBlogsRepository
      .createQueryBuilder('blog') // Start building a query
      .leftJoinAndSelect('blog.blogOwner', 'blogOwner') // Eager load the blogOwner relationship
      .where('blog.id = :blogId', { blogId });

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

  async findNotBannedBlogById(
    blogId: string,
  ): Promise<BloggerBlogsEntity | null> {
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
    const blogEntity: BloggerBlogsEntity = BloggerBlogsEntity.createBlog(
      createBloggerBlogsDto,
      currentUser,
    );

    const queryBuilder = this.bloggerBlogsRepository
      .createQueryBuilder()
      .insert()
      .into(BloggerBlogsEntity)
      .values(blogEntity)
      .returning(
        `"id", "name", "description", "websiteUrl", "createdAt", "isMembership"`,
      );

    try {
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

  async saBindBlogWithUser(
    userForBind: UsersEntity,
    blogForBind: BloggerBlogsEntity,
  ): Promise<boolean> {
    const connection = this.bloggerBlogsRepository.manager.connection;
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();

      // Update Comments table
      await connection.manager.update(
        CommentsEntity,
        {
          blog: blogForBind,
        },
        { blogOwner: userForBind },
      );

      // Update Posts table
      await connection.manager.update(
        PostsEntity,
        {
          blog: blogForBind,
        },
        { postOwner: userForBind },
      );

      // Update BloggerBlogs table
      blogForBind.blogOwner = userForBind;
      await connection.manager.save(blogForBind);

      // Commit the transaction
      await queryRunner.commitTransaction();

      console.log(
        `"🔗 Blog ${blogForBind.id} has been successfully bound with user ${userForBind.userId}. 🔗"`,
      );

      return true;
    } catch (error) {
      console.error(
        `Error occurred while binding blog ${blogForBind.id} with user ${userForBind.userId}:`,
        error,
      );
      console.log('rollbackTransaction');
      await queryRunner.rollbackTransaction();
      return false;
    } finally {
      await queryRunner.release();
    }
  }

  async saManageBlogAccess(
    blog: BloggerBlogsEntity,
    saBanBlogDto: SaBanBlogDto,
  ): Promise<boolean> {
    const { isBanned } = saBanBlogDto;
    const isBannedDate = isBanned ? new Date().toISOString() : null;

    const connection = this.bloggerBlogsRepository.manager.connection;
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();

      // Update LikeStatusCommentsEntity
      await connection.manager.update(
        LikeStatusCommentsEntity,
        { blog },
        { isBanned },
      );

      // Update LikeStatusPostsEntity
      await connection.manager.update(
        LikeStatusPostsEntity,
        { blog },
        { isBanned },
      );

      // Update CommentsEntity
      await connection.manager.update(CommentsEntity, { blog }, { isBanned });

      // Update PostsEntity
      await connection.manager.update(
        PostsEntity,
        { blog },
        { dependencyIsBanned: isBanned },
      );

      // Update BloggerBlogsEntity
      await connection.manager.update(
        BloggerBlogsEntity,
        { id: blog.id },
        {
          banInfoIsBanned: isBanned,
          banInfoBanDate: isBannedDate,
        },
      );

      // Commit the transaction
      await queryRunner.commitTransaction();

      if (isBanned) {
        console.log(
          `Blog Locked 🔒. The blog with ID ${blog.id} has been locked for the users. Access to the blog and its content has been restricted as per the defined policies or circumstances. Thank you for your understanding.`,
        );
      } else {
        // Successful Blog Unlock Message
        console.log(
          `Blog Unlocked 🚪. The blog with ID ${blog.id} has been successfully unlocked. Users can now access the blog and its content without any restrictions. Thank you for your attention to ensuring a positive user experience.`,
        );
      }

      return true;
    } catch (error) {
      console.error(
        `Error occurred while banning blog for blog ID ${blog.id}:`,
        error,
      );
      console.log('rollbackTransaction');
      await queryRunner.rollbackTransaction();
      return false;
    } finally {
      await queryRunner.release();
    }
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

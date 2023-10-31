import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BannedUsersForBlogsEntity } from '../entities/banned-users-for-blogs.entity';
import { InternalServerErrorException } from '@nestjs/common';
import { ParseQueriesDto } from '../../../common/query/dto/parse-queries.dto';
import { BannedUsersEntityAndCountDto } from '../../blogger-blogs/dto/banned-users-entity-and-count.dto';
import { UsersEntity } from '../entities/users.entity';
import { UpdateBanUserDto } from '../../blogger-blogs/dto/update-ban-user.dto';
import { BloggerBlogsEntity } from '../../blogger-blogs/entities/blogger-blogs.entity';
import { KeyResolver } from '../../../common/helpers/key-resolver';
import { SortDirectionEnum } from '../../../common/query/enums/sort-direction.enum';
import { LikeStatusPostsEntity } from '../../posts/entities/like-status-posts.entity';
import { LikeStatusCommentsEntity } from '../../comments/entities/like-status-comments.entity';
import { CommentsEntity } from '../../comments/entities/comments.entity';

export class BannedUsersForBlogsRepo {
  constructor(
    @InjectRepository(BannedUsersForBlogsEntity)
    private readonly bannedUsersForBlogsRepo: Repository<BannedUsersForBlogsEntity>,
    protected keyResolver: KeyResolver,
  ) {}

  async findBannedUsers(
    blogId: string,
    queryData: ParseQueriesDto,
  ): Promise<BannedUsersEntityAndCountDto> {
    const { sortBy, sortDirection, pageSize, pageNumber } =
      queryData.queryPagination;

    try {
      const searchLoginTerm = queryData.searchLoginTerm;
      const field: string = await this.getSortByField(sortBy);
      const direction: SortDirectionEnum = sortDirection;
      const limit: number = pageSize;
      const offset: number = (pageNumber - 1) * limit;

      const queryBuilder = this.bannedUsersForBlogsRepo
        .createQueryBuilder('banned_users')
        .select([
          'banned_users.id',
          'banned_users.blogId',
          'banned_users.userId',
          'banned_users.login',
          'banned_users.isBanned',
          'banned_users.banDate',
          'banned_users.banReason',
        ])
        .leftJoinAndSelect(
          'banned_users.bannedUserForBlogs',
          'bannedUserForBlogs',
        )
        .leftJoinAndSelect('banned_users.bannedBlog', 'bannedBlog')
        .where('banned_users.blogId = :blogId', { blogId })
        .andWhere('banned_users.login ILIKE :searchLoginTerm', {
          searchLoginTerm: searchLoginTerm,
        })
        .orderBy(`banned_users.${field}`, direction)
        .offset(offset)
        .limit(limit);

      const [bannedUsers, count] = await queryBuilder.getManyAndCount();

      if (bannedUsers.length === 0) {
        return {
          bannedUsers: [],
          countBannedUsers: 0,
        };
      }

      return {
        bannedUsers: bannedUsers,
        countBannedUsers: count,
      };
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async userIsBanned(userId: string, blogId: string): Promise<boolean> {
    try {
      const bannedUser = await this.bannedUsersForBlogsRepo
        .createQueryBuilder('banned_users')
        .leftJoinAndSelect(
          'banned_users.bannedUserForBlogs',
          'bannedUserForBlogs',
        )
        .leftJoinAndSelect('banned_users.bannedBlog', 'bannedBlog')
        .where('bannedUserForBlogs.userId = :userId', { userId })
        .andWhere('bannedBlog.id = :blogId', { blogId })
        .getOne();

      // Check if the user is found
      return !!bannedUser;
    } catch (error) {
      console.log(error.message);
      // Handle any errors and return false
      return false;
    }
  }

  async manageBlogAccess(
    user: UsersEntity,
    blog: BloggerBlogsEntity,
    updateBanUserDto: UpdateBanUserDto,
  ): Promise<boolean> {
    const connection = this.bannedUsersForBlogsRepo.manager.connection;
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();

    const bannedUserEntity: BannedUsersForBlogsEntity =
      BannedUsersForBlogsEntity.createBannedUserEntity(
        user,
        blog,
        updateBanUserDto,
      );

    try {
      await queryRunner.startTransaction();

      await connection.manager.update(
        LikeStatusPostsEntity,
        {
          ratedPostUser: user,
          blog: blog,
        },
        { isBanned: updateBanUserDto.isBanned },
      );

      // Update LikeStatusComments table
      await connection.manager.update(
        LikeStatusCommentsEntity,
        [
          {
            ratedCommentUser: user,
            blog: blog,
          },
          {
            commentOwner: user,
            blog: blog,
          },
        ],
        { isBanned: updateBanUserDto.isBanned },
      );

      await connection.manager.update(
        CommentsEntity,
        {
          commentator: user,
          blog: blog,
        },
        {
          dependencyIsBanned: updateBanUserDto.isBanned,
        },
      );

      if (updateBanUserDto.isBanned) {
        // Insert if banned
        await connection.manager.save(
          BannedUsersForBlogsEntity,
          bannedUserEntity,
        );
        await queryRunner.commitTransaction();
      } else {
        // Delete record from BannedUsersForBlogs if unBan user
        await connection.manager.delete(BannedUsersForBlogsEntity, {
          bannedUserForBlogs: user,
          bannedBlog: blog,
        });
        await queryRunner.commitTransaction();
      }

      if (updateBanUserDto.isBanned) {
        // Successful User Ban Message
        console.log(
          `User ${user.userId} has been blocked from accessing Blog ID ${blog.id}. 🚫`,
        );
      } else {
        // Successful User unBan Message
        console.log(
          `User with ID ${user.userId} has been unbanned for the blog with ID ${blog.id} 🚪`,
        );
      }
      return true;
    } catch (error) {
      console.log('rollbackTransaction');
      console.error(
        `Error occurred while banning user ${user.userId} for Blog ID ${blog.id}:`,
        error,
      );
      await queryRunner.rollbackTransaction();
      return false;
    } finally {
      await queryRunner.release();
    }
  }

  private async getSortByField(sortBy: string): Promise<string> {
    return await this.keyResolver.resolveKey(
      sortBy,
      ['banDate', 'banReason', 'isBanned', 'login'],
      'banDate',
    );
  }
}

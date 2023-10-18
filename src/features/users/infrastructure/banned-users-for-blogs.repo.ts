import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BannedUsersForBlogsEntity } from '../entities/banned-users-for-blogs.entity';
import { InternalServerErrorException } from '@nestjs/common';
import { ParseQueriesDto } from '../../../common/query/dto/parse-queries.dto';
import { BannedUsersEntityAndCountDto } from '../../blogger-blogs/dto/banned-users-entity-and-count.dto';
import { UsersEntity } from '../entities/users.entity';
import { UpdateBanUserDto } from '../../blogger-blogs/dto/update-ban-user.dto';
import { BloggerBlogsEntity } from '../../blogger-blogs/entities/blogger-blogs.entity';
import * as uuid4 from 'uuid4';

export class BannedUsersForBlogsRepo {
  constructor(
    @InjectRepository(BannedUsersForBlogsEntity)
    private readonly bannedUsersForBlogsRepo: Repository<BannedUsersForBlogsEntity>,
  ) {}

  async findBannedUsers(
    blogId: string,
    queryData: ParseQueriesDto,
  ): Promise<BannedUsersEntityAndCountDto> {
    try {
      const searchLoginTerm = queryData.searchLoginTerm;
      const sortBy = queryData.queryPagination.sortBy;
      const direction = queryData.queryPagination.sortDirection;
      const limit = queryData.queryPagination.pageSize;
      const offset = (queryData.queryPagination.pageNumber - 1) * limit;

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
        .where('banned_users.blogId = :blogId', { blogId })
        .andWhere('banned_users.login ILIKE :searchLoginTerm', {
          searchLoginTerm: searchLoginTerm,
        })
        .orderBy(`banned_users.${sortBy}`, direction)
        .skip(offset)
        .take(limit);

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

  async createBannedUserEntity(
    user: UsersEntity,
    blog: BloggerBlogsEntity,
    updateBanUserDto: UpdateBanUserDto,
  ): Promise<BannedUsersForBlogsEntity> {
    const { isBanned, banReason } = updateBanUserDto;

    const bannedUser = new BannedUsersForBlogsEntity();
    bannedUser.id = uuid4().toString();
    bannedUser.isBanned = isBanned;
    bannedUser.banReason = banReason;
    bannedUser.bannedBlog = blog;
    bannedUser.bannedUserForBlogs = user;

    return bannedUser;
  }
}

import { Injectable } from '@nestjs/common';
import { PaginationDto } from '../../infrastructure/common/pagination/dto/pagination.dto';
import { ConvertFiltersForDB } from '../../infrastructure/common/convert-filters/convertFiltersForDB';
import { Pagination } from '../../infrastructure/common/pagination/pagination';
import { UsersRepository } from '../infrastructure/users.repository';
import { PaginationTypes } from '../../infrastructure/common/pagination/types/pagination.types';
import { UsersEntity } from '../entities/users.entity';
import { QueryArrType } from '../../infrastructure/common/convert-filters/types/convert-filter.types';
import { PostsEntity } from '../../posts/entities/posts.entity';

@Injectable()
export class UsersService {
  constructor(
    protected convertFiltersForDB: ConvertFiltersForDB,
    protected pagination: Pagination,
    protected usersRepository: UsersRepository,
  ) {}

  async findUserByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<UsersEntity | null> {
    return await this.usersRepository.findUserByLoginOrEmail(loginOrEmail);
  }

  async findUsers(
    queryPagination: PaginationDto,
    searchFilters: QueryArrType,
  ): Promise<PaginationTypes> {
    const field = queryPagination.sortBy;
    const pageNumber = queryPagination.pageNumber;
    const pageSize = queryPagination.pageSize;

    const convertedFilters = await this.convertFiltersForDB.convert(
      searchFilters,
    );
    const totalCount = await this.usersRepository.countDocuments(
      convertedFilters,
    );
    const pagesCount = Math.ceil(totalCount / pageSize);
    const pagination = await this.pagination.convert(queryPagination, field);
    const posts = await this.usersRepository.findUsers(
      pagination,
      convertedFilters,
    );
    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: posts,
    };
  }

  async findUserByUserId(userId: string): Promise<UsersEntity | null> {
    return await this.usersRepository.findUserByUserId(userId);
  }

  async postsWithoutBannedUser(
    commentsArr: PostsEntity[],
  ): Promise<PostsEntity[]> {
    const postsWithoutBannedUser: PostsEntity[] = [];
    for (let i = 0; i < commentsArr.length; i++) {
      const user = await this.usersRepository.findUserByUserId(
        commentsArr[i].blogId,
      );
      if (user && !user.banInfo.isBanned) {
        postsWithoutBannedUser.push(commentsArr[i]);
      }
    }
    return postsWithoutBannedUser;
  }
}

import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto } from '../dto/update-user.dto';
import { PaginationDto } from '../../infrastructure/common/pagination/dto/pagination.dto';
import { ConvertFiltersForDB } from '../../infrastructure/common/convert-filters/convertFiltersForDB';
import { Pagination } from '../../infrastructure/common/pagination/pagination';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../ability/roles/action.enum';
import { CaslAbilityFactory } from '../../ability/casl-ability.factory';
import { UsersRepository } from '../infrastructure/users.repository';
import { BanInfo, User } from '../infrastructure/schemas/user.schema';
import { PaginationTypes } from '../../infrastructure/common/pagination/types/pagination.types';
import { UsersEntity } from '../entities/users.entity';
import { QueryArrType } from '../../infrastructure/common/convert-filters/types/convert-filter.types';
import { UpdateBanDto } from '../../sa/dto/update-sa.dto';
import { CommentsEntity } from '../../comments/entities/comments.entity';
import { PostsEntity } from '../../posts/entities/posts.entity';

@Injectable()
export class UsersService {
  constructor(
    protected convertFiltersForDB: ConvertFiltersForDB,
    protected pagination: Pagination,
    protected caslAbilityFactory: CaslAbilityFactory,
    protected usersRepository: UsersRepository,
  ) {}
  async findUserByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<UsersEntity | null> {
    return await this.usersRepository.findUserByLoginOrEmail(loginOrEmail);
  }
  async userAlreadyExist(login: string, email: string): Promise<string | null> {
    return await this.usersRepository.userAlreadyExist(login, email);
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

  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
    currentUser: UsersEntity,
  ) {
    const userToUpdate = await this.usersRepository.findUserByUserId(id);
    if (!userToUpdate || userToUpdate.id !== currentUser.id)
      throw new ForbiddenException();
    const ability = this.caslAbilityFactory.createForUser(currentUser);
    try {
      ForbiddenError.from(ability).throwUnlessCan(Action.UPDATE, userToUpdate);
      //Update call DB
      return `This action update a #${id} user`;
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      }
    }
  }

  async addSentEmailTime(email: string) {
    const currentTime = new Date().toISOString();
    return await this.usersRepository.addSentEmailTime(email, currentTime);
  }

  async removeUserById(id: string, currentUser: User) {
    const userToDelete = await this.usersRepository.findUserByUserId(id);
    if (!userToDelete) throw new NotFoundException();
    try {
      const ability = this.caslAbilityFactory.createForUser(currentUser);
      ForbiddenError.from(ability).throwUnlessCan(Action.DELETE, userToDelete);
      return this.usersRepository.removeUserById(id);
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      }
      if (error instanceof NotFoundException) {
        throw new NotFoundException();
      }
    }
  }
  async changeRole(newUser: UsersEntity): Promise<UsersEntity | null> {
    return await this.usersRepository.changeRole(newUser);
  }
  async commentsWithoutBannedUser(
    commentsArr: CommentsEntity[],
  ): Promise<CommentsEntity[]> {
    const commentsWithoutBannedUser: CommentsEntity[] = [];
    for (let i = 0; i < commentsArr.length; i++) {
      const user = await this.usersRepository.findUserByUserId(
        commentsArr[i].userId,
      );
      if (user && !user.banInfo.isBanned) {
        commentsWithoutBannedUser.push(commentsArr[i]);
      }
    }
    return commentsWithoutBannedUser;
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
  async banUser(
    id: string,
    updateBanDto: UpdateBanDto,
    currentUser: User,
  ): Promise<boolean | undefined> {
    const userToBan = await this.usersRepository.findUserByUserId(id);
    if (!userToBan) throw new NotFoundException();
    let updateBan: BanInfo = {
      isBanned: updateBanDto.isBanned,
      banDate: null,
      banReason: null,
    };
    if (updateBanDto.isBanned) {
      updateBan = {
        isBanned: updateBanDto.isBanned,
        banDate: new Date().toISOString(),
        banReason: updateBanDto.banReason,
      };
    }
    try {
      const ability = this.caslAbilityFactory.createForUser(currentUser);
      ForbiddenError.from(ability).throwUnlessCan(Action.DELETE, userToBan);
      return this.usersRepository.banUser(userToBan, updateBan);
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      }
      if (error instanceof NotFoundException) {
        throw new NotFoundException();
      }
    }
  }
}

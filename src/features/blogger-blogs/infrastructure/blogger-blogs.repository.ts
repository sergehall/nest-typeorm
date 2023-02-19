import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { BloggerBlogsEntity } from '../entities/blogger-blogs.entity';
import { ProvidersEnums } from '../../../infrastructure/database/enums/providers.enums';
import { Model } from 'mongoose';
import { QueryArrType } from '../../common/convert-filters/types/convert-filter.types';
import { PaginationDBType } from '../../common/pagination/types/pagination.types';
import { BBlogsDocument } from './schemas/blogger-blogs.schema';
import { BBlogsBannedUserDocument } from './schemas/blogger-blogs-banned-users.schema';
import {
  BanInfo,
  UsersBannedByBlogIdEntity,
} from '../entities/blogger-blogs-banned-users.entity';

@Injectable()
export class BloggerBlogsRepository {
  constructor(
    @Inject(ProvidersEnums.BBLOG_MODEL)
    private BBlogsModel: Model<BBlogsDocument>,
    @Inject(ProvidersEnums.BBLOG_BANNED_USER_MODEL)
    private BBannedUsersModel: Model<BBlogsBannedUserDocument>,
  ) {}

  async openFindBlogs(
    pagination: PaginationDBType,
    searchFilters: QueryArrType,
  ): Promise<BloggerBlogsEntity[]> {
    return await this.BBlogsModel.find(
      {
        $and: searchFilters,
      },
      {
        _id: false,
        __v: false,
        banInfo: false,
        'blogOwnerInfo._id': false,
        'blogOwnerInfo.isBanned': false,
      },
    )
      .limit(pagination.pageSize)
      .skip(pagination.startIndex)
      .sort({ [pagination.field]: pagination.direction })
      .lean();
  }

  async openFindBlogById(
    searchFilters: QueryArrType,
  ): Promise<BloggerBlogsEntity | null> {
    return await this.BBlogsModel.findOne(
      {
        $and: searchFilters,
      },
      {
        _id: false,
        __v: false,
        blogOwnerInfo: false,
        banInfo: false,
      },
    );
  }
  async createBlogs(
    blogsEntity: BloggerBlogsEntity,
  ): Promise<BloggerBlogsEntity> {
    try {
      return await this.BBlogsModel.create(blogsEntity);
    } catch (error) {
      throw new ForbiddenException(error.message);
    }
  }
  async countDocuments(searchFilters: QueryArrType): Promise<number> {
    return await this.BBlogsModel.countDocuments({
      $and: searchFilters,
    });
  }
  async findBlogById(blogId: string): Promise<BloggerBlogsEntity | null> {
    return await this.BBlogsModel.findOne(
      { id: blogId },
      {
        _id: false,
        __v: false,
      },
    );
  }

  async findBlogsCurrentUser(
    pagination: PaginationDBType,
    searchFilters: QueryArrType,
  ): Promise<BloggerBlogsEntity[]> {
    return await this.BBlogsModel.find(
      {
        $and: searchFilters,
      },
      {
        _id: false,
        __v: false,
        banInfo: false,
        blogOwnerInfo: false,
      },
    )
      .limit(pagination.pageSize)
      .skip(pagination.startIndex)
      .sort({ [pagination.field]: pagination.direction })
      .lean();
  }

  async saFindBlogs(
    pagination: PaginationDBType,
    searchFilters: QueryArrType,
  ): Promise<BloggerBlogsEntity[]> {
    return await this.BBlogsModel.find(
      {
        $and: searchFilters,
      },
      {
        _id: false,
        __v: false,
        'banInfo.banReason': false,
        'blogOwnerInfo._id': false,
        'blogOwnerInfo.isBanned': false,
      },
    )
      .limit(pagination.pageSize)
      .skip(pagination.startIndex)
      .sort({ [pagination.field]: pagination.direction })
      .lean();
  }
  async updatedBlogById(blogEntity: BloggerBlogsEntity): Promise<boolean> {
    return await this.BBlogsModel.findOneAndUpdate(
      { id: blogEntity.id },
      { $set: blogEntity },
      { returnDocument: 'after', projection: { _id: false, __v: false } },
    ).lean();
  }
  async removeBlogById(id: string): Promise<boolean> {
    const result = await this.BBlogsModel.deleteOne({ id: id });
    return result.acknowledged && result.deletedCount === 1;
  }
  async addBannedUserToBanList(
    banUserInfo: UsersBannedByBlogIdEntity,
  ): Promise<boolean> {
    const updateBan = await this.BBannedUsersModel.findOneAndUpdate(
      { $and: [{ id: banUserInfo.id, blogId: banUserInfo.blogId }] },
      {
        $set: {
          blogId: banUserInfo.blogId,
          id: banUserInfo.id,
          login: banUserInfo.login,
          'banInfo.isBanned': banUserInfo.banInfo.isBanned,
          'banInfo.banDate': banUserInfo.banInfo.banDate,
          'banInfo.banReason': banUserInfo.banInfo.banReason,
        },
      },
      { upsert: true },
    ).lean();
    return updateBan !== null;
  }
  async banBlog(blogId: string, banInfo: BanInfo): Promise<boolean> {
    const updateBan = await this.BBlogsModel.updateOne(
      { id: blogId },
      {
        $set: {
          'banInfo.isBanned': banInfo.isBanned,
          'banInfo.banDate': banInfo.banDate,
          'banInfo.banReason': banInfo.banReason,
        },
      },
    );
    return updateBan !== null;
  }
  async countBannedUsersDocuments(
    searchFilters: QueryArrType,
  ): Promise<number> {
    return await this.BBannedUsersModel.countDocuments({
      $and: searchFilters,
    });
  }
  async findBannedUsers(
    pagination: PaginationDBType,
    searchFilters: QueryArrType,
  ): Promise<UsersBannedByBlogIdEntity[]> {
    return await this.BBannedUsersModel.find(
      {
        $and: searchFilters,
      },
      {
        blogId: false,
        _id: false,
        __v: false,
        'banInfo._id': false,
      },
    )
      .limit(pagination.pageSize)
      .skip(pagination.startIndex)
      .sort({ [pagination.field]: pagination.direction })
      .lean();
  }
  async changeBanStatusOwnerBlog(
    userId: string,
    isBanned: boolean,
  ): Promise<boolean> {
    const updateBan = await this.BBlogsModel.updateMany(
      { 'blogOwnerInfo.userId': userId },
      {
        $set: {
          'blogOwnerInfo.isBanned': isBanned,
        },
      },
    );
    return updateBan !== null;
  }
  async verifyUserInBlackListForBlog(
    userId: string,
    blogId: string,
  ): Promise<boolean> {
    const result = await this.BBannedUsersModel.findOne({
      $and: [{ id: userId }, { blogId: blogId }, { 'banInfo.isBanned': true }],
    });
    return result !== null;
  }
}

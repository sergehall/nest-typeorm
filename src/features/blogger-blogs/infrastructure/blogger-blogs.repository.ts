import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { BloggerBlogsEntity } from '../entities/blogger-blogs.entity';
import { ProvidersEnums } from '../../../infrastructure/database/enums/providers.enums';
import { Model } from 'mongoose';
import { QueryArrType } from '../../common/convert-filters/types/convert-filter.types';
import { PaginationDBType } from '../../common/pagination/types/pagination.types';
import { BBlogsDocument } from './schemas/blogger-blogs.schema';
import { BBlogsBannedUsersEntity } from '../../comments/entities/bBlogs-banned-users.entity';
import { BBlogsBannedUserDocument } from './schemas/blogger-blogs-banned-users.schema';

@Injectable()
export class BloggerBlogsRepository {
  constructor(
    @Inject(ProvidersEnums.BBLOG_MODEL)
    private BBlogsModel: Model<BBlogsDocument>,
    @Inject(ProvidersEnums.BBLOG_BANNED_USER_MODEL)
    private BBannedUsersModel: Model<BBlogsBannedUserDocument>,
  ) {}
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
  async findBlogByIdForBlogs(
    blogId: string,
  ): Promise<BloggerBlogsEntity | null> {
    return await this.BBlogsModel.findOne(
      { id: blogId },
      {
        _id: false,
        __v: false,
        blogOwnerInfo: false,
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
        blogOwnerInfo: false,
      },
    )
      .limit(pagination.pageSize)
      .skip(pagination.startIndex)
      .sort({ [pagination.field]: pagination.direction })
      .lean();
  }
  async findBlogs(
    pagination: PaginationDBType,
    searchFilters: QueryArrType,
  ): Promise<BloggerBlogsEntity[]> {
    return await this.BBlogsModel.find(
      {
        $or: searchFilters,
      },
      {
        _id: false,
        __v: false,
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
      {
        $set: {
          id: blogEntity.id,
          name: blogEntity.name,
          description: blogEntity.description,
          websiteUrl: blogEntity.websiteUrl,
          createdAt: blogEntity.createdAt,
          blogOwnerInfo: {
            userId: blogEntity.blogOwnerInfo.userId,
            userLogin: blogEntity.blogOwnerInfo.userLogin,
          },
        },
      },
      { returnDocument: 'after', projection: { _id: false, __v: false } },
    ).lean();
  }
  async removeBlogById(id: string): Promise<boolean> {
    const result = await this.BBlogsModel.deleteOne({ id: id });
    return result.acknowledged && result.deletedCount === 1;
  }
  async banUserForBlog(
    blogId: string,
    banUserInfo: BBlogsBannedUsersEntity,
  ): Promise<boolean> {
    const updateBan = await this.BBannedUsersModel.findOneAndUpdate(
      { $and: [{ id: banUserInfo.id, blogId: blogId }] },
      {
        $set: {
          blogId: blogId,
          id: banUserInfo.id,
          login: banUserInfo.login,
          createdAt: banUserInfo.createdAt,
          'banInfo.isBanned': banUserInfo.banInfo.isBanned,
          'banInfo.banReason': banUserInfo.banInfo.banReason,
          'banInfo.banDate': banUserInfo.banInfo.banDate,
        },
      },
      { upsert: true },
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
  ): Promise<BBlogsBannedUsersEntity[]> {
    return await this.BBannedUsersModel.find(
      {
        $and: searchFilters,
      },
      {
        blogId: false,
        createdAt: false,
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
}

import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { BBlogsEntity } from '../entities/bblogs.entity';
import { ProvidersEnums } from '../../infrastructure/database/enums/providers.enums';
import { Model } from 'mongoose';
import { BBlogsDocument } from './schemas/bblogs.schema';
import { QueryArrType } from '../../infrastructure/common/convert-filters/types/convert-filter.types';
import { PaginationDBType } from '../../infrastructure/common/pagination/types/pagination.types';

@Injectable()
export class BBlogsRepository {
  constructor(
    @Inject(ProvidersEnums.BBLOG_MODEL)
    private BBlogsModel: Model<BBlogsDocument>,
  ) {}
  async createBBlogs(blogsEntity: BBlogsEntity): Promise<BBlogsEntity> {
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
  async findBlogById(blogId: string): Promise<BBlogsEntity | null> {
    return await this.BBlogsModel.findOne(
      { id: blogId },
      {
        _id: false,
        __v: false,
      },
    );
  }
  async findBlogsByUserId(
    pagination: PaginationDBType,
    searchFilters: QueryArrType,
  ): Promise<BBlogsEntity[]> {
    return await this.BBlogsModel.find(
      {
        $or: searchFilters,
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
  ): Promise<BBlogsEntity[]> {
    return await this.BBlogsModel.find(
      {
        $or: searchFilters,
      },
      {
        _id: false,
        __v: false,
        'blogOwnerInfo._id': false,
      },
    )
      .limit(pagination.pageSize)
      .skip(pagination.startIndex)
      .sort({ [pagination.field]: pagination.direction })
      .lean();
  }
  async updatedBlogById(blogEntity: BBlogsEntity): Promise<boolean> {
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
}

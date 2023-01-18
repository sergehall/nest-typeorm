import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { BloggerBlogsEntity } from '../entities/blogger-blogs.entity';
import { ProvidersEnums } from '../../infrastructure/database/enums/providers.enums';
import { Model } from 'mongoose';
import { QueryArrType } from '../../infrastructure/common/convert-filters/types/convert-filter.types';
import { PaginationDBType } from '../../infrastructure/common/pagination/types/pagination.types';
import { BBlogsDocument } from './schemas/blogger-blogsr.schema';

@Injectable()
export class BloggerBlogsRepository {
  constructor(
    @Inject(ProvidersEnums.BBLOG_MODEL)
    private BlogsModel: Model<BBlogsDocument>,
  ) {}
  async createBlogs(
    blogsEntity: BloggerBlogsEntity,
  ): Promise<BloggerBlogsEntity> {
    try {
      return await this.BlogsModel.create(blogsEntity);
    } catch (error) {
      throw new ForbiddenException(error.message);
    }
  }
  async countDocuments(searchFilters: QueryArrType): Promise<number> {
    return await this.BlogsModel.countDocuments({
      $and: searchFilters,
    });
  }
  async findBlogById(blogId: string): Promise<BloggerBlogsEntity | null> {
    return await this.BlogsModel.findOne(
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
    return await this.BlogsModel.findOne(
      { id: blogId },
      {
        _id: false,
        __v: false,
        blogOwnerInfo: false,
      },
    );
  }
  async findBlogsByUserId(
    pagination: PaginationDBType,
    searchFilters: QueryArrType,
  ): Promise<BloggerBlogsEntity[]> {
    return await this.BlogsModel.find(
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
  ): Promise<BloggerBlogsEntity[]> {
    return await this.BlogsModel.find(
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
    return await this.BlogsModel.findOneAndUpdate(
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
    const result = await this.BlogsModel.deleteOne({ id: id });
    return result.acknowledged && result.deletedCount === 1;
  }
}

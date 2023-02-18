import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { PostsEntity } from '../entities/posts.entity';
import { Model } from 'mongoose';
import { QueryArrType } from '../../common/convert-filters/types/convert-filter.types';
import { PaginationDBType } from '../../common/pagination/types/pagination.types';
import { ProvidersEnums } from '../../../infrastructure/database/enums/providers.enums';
import { BanInfo, PostsDocument } from './schemas/posts.schema';
import { UpdateBanUserDto } from '../../blogger-blogs/dto/update-ban-user.dto';
import { UpdateDataPostBloggerBlogsDto } from '../../blogger-blogs/dto/update-data-post-blogger-blogs.dto';

@Injectable()
export class PostsRepository {
  constructor(
    @Inject(ProvidersEnums.POST_MODEL)
    private postsModel: Model<PostsDocument>,
  ) {}
  async findPosts(
    pagination: PaginationDBType,
    searchFilters: QueryArrType,
  ): Promise<PostsEntity[]> {
    return await this.postsModel
      .find(
        { $and: searchFilters },
        {
          _id: false,
          __v: false,
          'extendedLikesInfo._id': false,
          'extendedLikesInfo.newestLikes._id': false,
        },
      )
      .limit(pagination.pageSize)
      .skip(pagination.startIndex)
      .sort({ [pagination.field]: pagination.direction })
      .lean();
  }
  async openFindPostById(
    searchFilters: QueryArrType,
  ): Promise<PostsEntity | null> {
    return await this.postsModel.findOne(
      { $and: searchFilters },
      {
        _id: false,
        __v: false,
        'extendedLikesInfo._id': false,
        'extendedLikesInfo.newestLikes._id': false,
        'extendedLikesInfo.newestLikes.blogId': false,
      },
    );
  }
  async findPostById(postId: string): Promise<PostsEntity | null> {
    return await this.postsModel.findOne(
      { id: postId },
      {
        _id: false,
        __v: false,
        'extendedLikesInfo._id': false,
        'extendedLikesInfo.newestLikes._id': false,
        'extendedLikesInfo.newestLikes.blogId': false,
      },
    );
  }
  async checkPostInDB(postId: string): Promise<PostsEntity | null> {
    return await this.postsModel.findOne(
      { id: postId },
      {
        _id: false,
        __v: false,
        'extendedLikesInfo._id': false,
        'extendedLikesInfo.newestLikes._id': false,
      },
    );
  }
  async createPost(newPost: PostsEntity): Promise<PostsEntity> {
    try {
      return await this.postsModel.create(newPost);
    } catch (error) {
      throw new ForbiddenException(error.message);
    }
  }
  async countDocuments(searchFilters: QueryArrType): Promise<number> {
    return await this.postsModel.countDocuments({
      $or: searchFilters,
    });
  }
  async updatePost(
    postId: string,
    updatePostBloggerBlogsDto: UpdateDataPostBloggerBlogsDto,
  ): Promise<PostsEntity> {
    return await this.postsModel
      .findOneAndUpdate(
        { id: postId },
        {
          $set: {
            title: updatePostBloggerBlogsDto.title,
            shortDescription: updatePostBloggerBlogsDto.shortDescription,
            content: updatePostBloggerBlogsDto.content,
          },
        },
        {
          returnDocument: 'after',
          projection: {
            _id: false,
            __v: false,
            'extendedLikesInfo._id': false,
            'extendedLikesInfo.newestLikes._id': false,
            'extendedLikesInfo.newestLikes.blogId': false,
            postOwnerInfo: false,
          },
        },
      )
      .lean();
  }
  async removePost(id: string): Promise<boolean> {
    const result = await this.postsModel.deleteOne({ id: id });
    return result.acknowledged && result.deletedCount === 1;
  }
  async changeBanStatusUserPosts(
    userId: string,
    isBanned: boolean,
  ): Promise<boolean> {
    const changeBanStatus = await this.postsModel
      .updateMany(
        { 'postOwnerInfo.id': userId },
        {
          $set: {
            'postOwnerInfo.isBanned': isBanned,
          },
        },
      )
      .lean();
    return changeBanStatus !== null;
  }
  async changeBanStatusPostsByUserIdBlogId(
    userId: string,
    updateBanUserDto: UpdateBanUserDto,
  ): Promise<boolean> {
    const changeBanStatus = await this.postsModel
      .updateMany(
        {
          $and: [
            { blogId: updateBanUserDto.blogId },
            { 'postOwnerInfo.userId': userId },
          ],
        },
        {
          $set: {
            'banInfo.isBanned': updateBanUserDto.isBanned,
            'banInfo.banDate': new Date().toISOString(),
            'banInfo.banReason': updateBanUserDto.banReason,
          },
        },
      )
      .lean();
    return changeBanStatus !== null;
  }
  async changeBanStatusPostByBlogId(
    blogId: string,
    banInfo: BanInfo,
  ): Promise<boolean> {
    const changeBanStatus = await this.postsModel
      .updateMany(
        { blogId: blogId },
        {
          $set: {
            'banInfo.isBanned': banInfo.isBanned,
            'banInfo.banDate': banInfo.banDate,
            'banInfo.banReason': banInfo.banReason,
          },
        },
      )
      .lean();
    return changeBanStatus !== null;
  }
}

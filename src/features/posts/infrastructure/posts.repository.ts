import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { PostsEntity } from '../entities/posts.entity';
import { Model } from 'mongoose';
import { QueryArrType } from '../../common/convert-filters/types/convert-filter.types';
import { PaginationDBType } from '../../common/pagination/types/pagination.types';
import { ProvidersEnums } from '../../../infrastructure/database/enums/providers.enums';
import { UpdatePostPlusIdDto } from '../dto/update-post-plusId.dto';
import { PostsDocument } from './schemas/posts.schema';
import { UpdateBanUserDto } from '../../blogger-blogs/dto/update-ban-user.dto';

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
  async findPostById(postId: string): Promise<PostsEntity | null> {
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
    updatePostPlusIdDto: UpdatePostPlusIdDto,
  ): Promise<PostsEntity> {
    return await this.postsModel
      .findOneAndUpdate(
        { id: updatePostPlusIdDto.id },
        {
          $set: {
            id: updatePostPlusIdDto.id,
            title: updatePostPlusIdDto.title,
            shortDescription: updatePostPlusIdDto.shortDescription,
            content: updatePostPlusIdDto.content,
            blogId: updatePostPlusIdDto.blogId,
          },
        },
        {
          returnDocument: 'after',
          projection: {
            _id: false,
            __v: false,
            'extendedLikesInfo._id': false,
            'extendedLikesInfo.newestLikes._id': false,
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
  async changeBanStatusPostByBlogId(
    userId: string,
    updateBanUserDto: UpdateBanUserDto,
  ): Promise<boolean> {
    const changeBanStatus = await this.postsModel
      .findOneAndUpdate(
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
}

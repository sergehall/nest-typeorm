import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { PostsEntity } from '../entities/posts.entity';
import { Model } from 'mongoose';
import { PostsDocument } from './schemas/posts.schema';
import { QueryArrType } from '../../infrastructure/common/convert-filters/types/convert-filter.types';
import { PaginationDBType } from '../../infrastructure/common/pagination/types/pagination.types';
import { ProvidersEnums } from '../../infrastructure/database/enums/providers.enums';
import { UpdatePostsEntity } from '../entities/update-posts.entity';

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
        postOwnerInfo: false,
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
  async createPost(postsEntity: PostsEntity): Promise<PostsEntity> {
    try {
      return await this.postsModel.create(postsEntity);
    } catch (error) {
      throw new ForbiddenException(error.message);
    }
  }
  async countDocuments(searchFilters: QueryArrType): Promise<number> {
    return await this.postsModel.countDocuments({
      $or: searchFilters,
    });
  }
  async updatePost(postsEntity: UpdatePostsEntity): Promise<PostsEntity> {
    return await this.postsModel
      .findOneAndUpdate(
        { id: postsEntity.id },
        {
          $set: {
            id: postsEntity.id,
            title: postsEntity.title,
            shortDescription: postsEntity.shortDescription,
            content: postsEntity.content,
            blogId: postsEntity.blogId,
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
  async changeBanStatusPostRepo(
    userId: string,
    isBanned: boolean,
  ): Promise<boolean> {
    const changeBanStatus = await this.postsModel
      .findOneAndUpdate(
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
}

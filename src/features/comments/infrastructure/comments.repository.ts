import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { ProvidersEnums } from '../../../infrastructure/database/enums/providers.enums';
import { CommentsDocument } from './schemas/comments.schema';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { BanInfo, CommentsEntity } from '../entities/comments.entity';
import { PaginationDBType } from '../../common/pagination/types/pagination.types';
import { QueryArrType } from '../../common/convert-filters/types/convert-filter.types';

@Injectable()
export class CommentsRepository {
  constructor(
    @Inject(ProvidersEnums.COMMENT_MODEL)
    private commentsModel: Model<CommentsDocument>,
  ) {}
  async createComment(commentEntity: CommentsEntity): Promise<CommentsEntity> {
    try {
      return await this.commentsModel.create(commentEntity);
    } catch (error) {
      console.log(error);
      throw new ForbiddenException(error.message);
    }
  }
  async findCommentById(commentId: string): Promise<CommentsEntity | null> {
    return await this.commentsModel
      .findOne(
        { id: commentId },
        {
          _id: false,
        },
      )
      .lean();
  }
  async findCommentsByPostId(
    pagination: PaginationDBType,
    searchFilters: QueryArrType,
  ): Promise<CommentsEntity[] | null> {
    return await this.commentsModel
      .find(
        {
          $and: searchFilters,
        },
        {
          _id: false,
          __v: false,
          likesInfo: false,
          banInfo: false,
          postInfo: false,
          'commentatorInfo._id': false,
          'commentatorInfo.isBanned': false,
        },
      )
      .limit(pagination.pageSize)
      .skip(pagination.startIndex)
      .sort({ [pagination.field]: pagination.direction })
      .lean();
  }
  async findCommentsByBlogOwnerId(
    pagination: PaginationDBType,
    searchFilters: QueryArrType,
  ): Promise<CommentsEntity[] | null> {
    return await this.commentsModel
      .find(
        {
          $and: searchFilters,
        },
        {
          _id: false,
          __v: false,
          likesInfo: false,
          banInfo: false,
          postInfo: false,
          'commentatorInfo._id': false,
          'commentatorInfo.isBanned': false,
        },
      )
      .limit(pagination.pageSize)
      .skip(pagination.startIndex)
      .sort({ [pagination.field]: pagination.direction })
      .lean();
  }
  async countDocuments(searchFilters: QueryArrType): Promise<number> {
    return await this.commentsModel.countDocuments({
      $and: searchFilters,
    });
  }
  async updateComment(
    commentId: string,
    updateCommentDto: UpdateCommentDto,
  ): Promise<boolean> {
    const result = await this.commentsModel.updateOne(
      { id: commentId },
      { $set: { content: updateCommentDto.content } },
    );

    return result.modifiedCount !== 0 && result.matchedCount !== 0;
  }
  async removeComment(commentId: string): Promise<boolean> {
    const resultDeleted = await this.commentsModel.deleteOne({ id: commentId });
    if (!resultDeleted) {
      return false;
    }
    return resultDeleted.deletedCount === 1;
  }
  async changeBanStatusCommentsByUserId(
    userId: string,
    isBanned: boolean,
  ): Promise<CommentsEntity[] | null> {
    return await this.commentsModel
      .updateMany(
        { 'commentatorInfo.userId': userId },
        { $set: { 'commentatorInfo.isBanned': isBanned } },
      )
      .lean();
  }
  async changeBanStatusCommentsByUserIdAndBlogId(
    userId: string,
    blogId: string,
    banInfo: BanInfo,
  ): Promise<CommentsEntity[] | null> {
    return await this.commentsModel
      .updateMany(
        {
          $and: [
            { 'postInfo.blogId': blogId },
            { 'commentatorInfo.userId': userId },
          ],
        },
        {
          $set: {
            banInfo: banInfo,
            'commentatorInfo.isBanned': banInfo.isBanned,
          },
        },
      )
      .lean();
  }
  async changeBanStatusCommentsByBlogId(
    blogId: string,
    isBanned: boolean,
  ): Promise<CommentsEntity[] | null> {
    return await this.commentsModel
      .updateMany(
        { 'postInfo.blogId': blogId },
        { $set: { 'commentatorInfo.isBanned': isBanned } },
      )
      .lean();
  }
}

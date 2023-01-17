import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { ProvidersEnums } from '../../infrastructure/database/enums/providers.enums';
import { Comment, CommentsDocument } from './schemas/comments.schema';
import { CommentsEntity } from '../entities/comment.entity';
import { UpdateCommentDto } from '../dto/update-comment.dto';

@Injectable()
export class CommentsRepository {
  constructor(
    @Inject(ProvidersEnums.COMMENT_MODEL)
    private commentsModel: Model<CommentsDocument>,
  ) {}
  async createComment(
    postId: string,
    commentEntity: CommentsEntity,
  ): Promise<CommentsEntity> {
    try {
      await this.commentsModel.findOneAndUpdate(
        { postId: postId },
        {
          $push: { comments: commentEntity },
        },
        { upsert: true },
      );
      return commentEntity;
    } catch (error) {
      console.log(error);
      throw new ForbiddenException(error.message);
    }
  }
  async findCommentById(commentId: string): Promise<Comment | null> {
    const result = await this.commentsModel
      .findOne(
        { 'comments.id': commentId },
        {
          _id: false,
          'comments._id': false,
        },
      )
      .then((c) => c?.comments.filter((i) => i.id === commentId)[0]);
    return result ? result : null;
  }
  async findCommentsByPostId(postId: string): Promise<CommentsDocument | null> {
    return await this.commentsModel.findOne(
      { postId: postId },
      { _id: false, 'comments._id': false },
    );
  }
  async updateComment(
    commentId: string,
    updateCommentDto: UpdateCommentDto,
  ): Promise<boolean> {
    const result = await this.commentsModel.updateOne(
      { 'comments.id': commentId },
      { $set: { 'comments.$.content': updateCommentDto.content } },
    );

    return result.modifiedCount !== 0 && result.matchedCount !== 0;
  }
  async removeComment(commentId: string): Promise<boolean> {
    const resultDeleted = await this.commentsModel.findOneAndUpdate(
      { 'comments.id': commentId },
      {
        $pull: {
          comments: {
            id: commentId,
          },
        },
      },
      { returnDocument: 'after' },
    );
    if (!resultDeleted) {
      return false;
    }
    // check comment is deleted
    return (
      resultDeleted.comments.filter((i) => i.id === commentId).length === 0
    );
  }
}

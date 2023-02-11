import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { ProvidersEnums } from '../../../infrastructure/database/enums/providers.enums';
import { LikeStatusCommentEntity } from '../entities/like-status-comment.entity';
import { LikeStatusCommentDocument } from './schemas/like-status-comments.schema';

@Injectable()
export class LikeStatusCommentsRepository {
  constructor(
    @Inject(ProvidersEnums.LIKE_STATUS_COMMENTS_MODEL)
    private likeStatusCommentModel: Model<LikeStatusCommentDocument>,
  ) {}
  async updateLikeStatusComment(
    likeStatusCommEntity: LikeStatusCommentEntity,
  ): Promise<boolean> {
    const result = await this.likeStatusCommentModel
      .findOneAndUpdate(
        {
          $and: [
            { commentId: likeStatusCommEntity.commentId },
            { userId: likeStatusCommEntity.userId },
          ],
        },
        {
          $set: {
            commentId: likeStatusCommEntity.commentId,
            userId: likeStatusCommEntity.userId,
            isBanned: likeStatusCommEntity.isBanned,
            likeStatus: likeStatusCommEntity.likeStatus,
            createdAt: likeStatusCommEntity.createdAt,
          },
        },
        { upsert: true, returnDocument: 'after' },
      )
      .lean();

    return result !== null;
  }

  async changeBanStatusComments(
    userId: string,
    isBanned: boolean,
  ): Promise<boolean> {
    const updateLikes = await this.likeStatusCommentModel.updateMany(
      {
        userId: userId,
      },
      { isBanned: isBanned },
    );
    return updateLikes.acknowledged;
  }
}

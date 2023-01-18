import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { ProvidersEnums } from '../../infrastructure/database/enums/providers.enums';
import { LikeStatusCommentEntity } from '../entities/like-status-comment.entity';
import { LikeStatusCommentDocument } from './schemas/like-status-comments.schema';
import { Comment } from './schemas/comments.schema';
import { UsersEntity } from '../../users/entities/users.entity';
import { StatusLike } from '../../infrastructure/database/enums/like-status.enums';

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
  async preparationCommentsForReturn(
    commentsArray: Comment[],
    currentUser: UsersEntity | null,
  ) {
    const filledComments = [];
    for (const i in commentsArray) {
      const commentId = commentsArray[i].id;
      const currentComment: Comment = commentsArray[i];

      let ownLikeStatus = StatusLike.NONE;
      if (currentUser) {
        const currentComment = await this.likeStatusCommentModel.findOne(
          {
            $and: [
              { userId: currentUser.id },
              { commentId: commentId },
              { isBanned: false },
            ],
          },
          {
            _id: false,
            __v: false,
          },
        );
        if (currentComment) {
          ownLikeStatus = currentComment.likeStatus;
        }
      }

      // getting likes count
      const likesCount = await this.likeStatusCommentModel.countDocuments({
        $and: [
          { commentId: commentId },
          { isBanned: false },
          { likeStatus: 'Like' },
        ],
      });

      // getting dislikes count
      const dislikesCount = await this.likeStatusCommentModel.countDocuments({
        $and: [
          { commentId: commentId },
          { likeStatus: 'Dislike' },
          { isBanned: false },
        ],
      });

      const filledComment = {
        id: currentComment.id,
        content: currentComment.content,
        userId: currentComment.userId,
        userLogin: currentComment.userLogin,
        createdAt: currentComment.createdAt,
        likesInfo: {
          likesCount: likesCount,
          dislikesCount: dislikesCount,
          myStatus: ownLikeStatus,
        },
      };
      filledComments.push(filledComment);
    }
    return filledComments;
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

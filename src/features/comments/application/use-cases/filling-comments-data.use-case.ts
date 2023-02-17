import { StatusLike } from '../../../../infrastructure/database/enums/like-status.enums';
import { Inject } from '@nestjs/common';
import { ProvidersEnums } from '../../../../infrastructure/database/enums/providers.enums';
import { Model } from 'mongoose';
import { LikeStatusCommentDocument } from '../../infrastructure/schemas/like-status-comments.schema';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { CommentsEntity } from '../../entities/comments.entity';

export class FillingCommentsDataCommand {
  constructor(
    public commentsArray: CommentsEntity[],
    public currentUser: CurrentUserDto | null,
  ) {}
}
@CommandHandler(FillingCommentsDataCommand)
export class FillingCommentsDataUseCase
  implements ICommandHandler<FillingCommentsDataCommand>
{
  constructor(
    @Inject(ProvidersEnums.LIKE_STATUS_COMMENTS_MODEL)
    private likeStatusCommentModel: Model<LikeStatusCommentDocument>,
  ) {}
  async execute(command: FillingCommentsDataCommand) {
    const filledComments = [];
    for (const i in command.commentsArray) {
      const commentId = command.commentsArray[i].id;
      const currentComment: CommentsEntity = command.commentsArray[i];

      let ownLikeStatus = StatusLike.NONE;
      if (command.currentUser) {
        const currentComment = await this.likeStatusCommentModel.findOne(
          {
            $and: [
              { userId: command.currentUser.id },
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
        createdAt: currentComment.createdAt,
        commentatorInfo: {
          userId: currentComment.commentatorInfo.userId,
          userLogin: currentComment.commentatorInfo.userLogin,
        },
        likesInfo: {
          likesCount: likesCount,
          dislikesCount: dislikesCount,
          myStatus: ownLikeStatus,
        },
        postInfo: {
          id: currentComment.postInfo.id,
          title: currentComment.postInfo.title,
          blogId: currentComment.postInfo.blogId,
          blogName: currentComment.postInfo.blogName,
        },
      };
      filledComments.push(filledComment);
    }
    return filledComments;
  }
}

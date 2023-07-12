import { StatusLike } from '../../../../infrastructure/database/enums/like-status.enums';
import { Inject, InternalServerErrorException } from '@nestjs/common';
import { ProvidersEnums } from '../../../../infrastructure/database/enums/providers.enums';
import { Model } from 'mongoose';
import { LikeStatusCommentDocument } from '../../infrastructure/schemas/like-status-comments.schema';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { CommentsEntity } from '../../entities/comments.entity';
import { TablesCommentsRawSqlEntity } from '../../entities/tables-comments-raw-sql.entity';
import { LikeStatusCommentsRawSqlRepository } from '../../infrastructure/like-status-comments-raw-sql.repository';

export class FillingCommentsDataCommand {
  constructor(
    public commentsArray: CommentsEntity[],
    public currentUserDto: CurrentUserDto | null,
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
      if (command.currentUserDto) {
        const currentComment = await this.likeStatusCommentModel.findOne(
          {
            $and: [
              { userId: command.currentUserDto.id },
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
      };
      filledComments.push(filledComment);
    }
    return filledComments;
  }
}
export class FillingCommentsDataCommand2 {
  constructor(
    public commentsArray2: TablesCommentsRawSqlEntity[],
    public currentUserDto: CurrentUserDto | null,
  ) {}
}
@CommandHandler(FillingCommentsDataCommand2)
export class FillingCommentsDataUseCase2
  implements ICommandHandler<FillingCommentsDataCommand2>
{
  constructor(
    protected likeStatusCommentsRawSqlRepository: LikeStatusCommentsRawSqlRepository,
  ) {}
  async execute(command: FillingCommentsDataCommand2) {
    try {
      const filledComments = [];
      for (const i in command.commentsArray2) {
        const commentId = command.commentsArray2[i].id;
        const isBanned = false;
        const currentComment: TablesCommentsRawSqlEntity =
          command.commentsArray2[i];
        let ownLikeStatus = StatusLike.NONE;
        if (command.currentUserDto) {
          const currentComment =
            await this.likeStatusCommentsRawSqlRepository.findOne(
              commentId,
              command.currentUserDto.id,
              isBanned,
            );
          if (currentComment[0]) {
            ownLikeStatus = currentComment[0].likeStatus;
          }
        }
        // getting likes count
        const like = 'Like';
        const likesCount =
          await this.likeStatusCommentsRawSqlRepository.countLikesDislikes(
            commentId,
            isBanned,
            like,
          );

        // getting dislikes count
        const dislike = 'Dislike';
        const dislikesCount =
          await this.likeStatusCommentsRawSqlRepository.countLikesDislikes(
            commentId,
            isBanned,
            dislike,
          );

        const filledComment = {
          id: currentComment.id,
          content: currentComment.content,
          createdAt: currentComment.createdAt,
          commentatorInfo: {
            userId: currentComment.commentatorInfoUserId,
            userLogin: currentComment.commentatorInfoUserLogin,
          },
          likesInfo: {
            likesCount: likesCount,
            dislikesCount: dislikesCount,
            myStatus: ownLikeStatus,
          },
          postInfo: {
            id: currentComment.postInfoId,
            title: currentComment.postInfoTitle,
            blogId: currentComment.postInfoBlogId,
            blogName: currentComment.postInfoBlogName,
          },
        };
        filledComments.push(filledComment);
      }
      return filledComments;
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }
}

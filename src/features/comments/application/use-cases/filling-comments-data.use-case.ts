import { StatusLike } from '../../../../infrastructure/database/enums/like-status.enums';
import { InternalServerErrorException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { TablesCommentsRawSqlEntity } from '../../entities/tables-comments-raw-sql.entity';
import { LikeStatusCommentsRawSqlRepository } from '../../infrastructure/like-status-comments-raw-sql.repository';
import { FilledCommentEntity } from '../../entities/filledComment.entity';

export class FillingCommentsDataCommand {
  constructor(
    public commentsArray: TablesCommentsRawSqlEntity[],
    public currentUserDto: CurrentUserDto | null,
  ) {}
}
@CommandHandler(FillingCommentsDataCommand)
export class FillingCommentsDataUseCase
  implements ICommandHandler<FillingCommentsDataCommand>
{
  constructor(
    protected likeStatusCommentsRawSqlRepository: LikeStatusCommentsRawSqlRepository,
  ) {}
  async execute(
    command: FillingCommentsDataCommand,
  ): Promise<FilledCommentEntity[]> {
    try {
      const filledComments = [];
      for (const i in command.commentsArray) {
        const commentId = command.commentsArray[i].id;
        const isBanned = false;
        const currentComment: TablesCommentsRawSqlEntity =
          command.commentsArray[i];
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

        const filledComment: FilledCommentEntity = {
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
            id: currentComment.postInfoPostId,
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

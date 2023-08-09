import { InternalServerErrorException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { LikeStatusCommentsRawSqlRepository } from '../../infrastructure/like-status-comments-raw-sql.repository';
import { LikeStatusEnums } from '../../../../config/db/mongo/enums/like-status.enums';
import { ReturnCommentsWithPostInfoEntity } from '../../entities/return-comments-with-post-info.entity';
import { TablesCommentsEntity } from '../../entities/tables-comments.entity';

export class FillingCommentsDataCommand {
  constructor(
    public commentsArray: TablesCommentsEntity[],
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
  ): Promise<ReturnCommentsWithPostInfoEntity[]> {
    try {
      const { commentsArray, currentUserDto } = command;

      const filledComments: ReturnCommentsWithPostInfoEntity[] = [];

      // Loop through each comment in the commentsArray provided in the command.
      for (const comment of commentsArray) {
        const commentId = comment.id;
        const isBanned = false;
        let ownLikeStatus = LikeStatusEnums.NONE;

        // If a currentUserDto is provided in the command, fetch the like status for the current user
        if (currentUserDto) {
          const currentComment =
            await this.likeStatusCommentsRawSqlRepository.findOne(
              commentId,
              currentUserDto.id,
              isBanned,
            );
          ownLikeStatus = currentComment[0]?.likeStatus || LikeStatusEnums.NONE;
        }

        // Get the count of likes for the current comment.
        const likesCount = await this.getLikesDislikesCount(
          commentId,
          isBanned,
          'Like',
        );

        // Get the count of dislikes for the current comment.
        const dislikesCount = await this.getLikesDislikesCount(
          commentId,
          isBanned,
          'Dislike',
        );

        // Create a FilledCommentEntity object with all the relevant information for the current comment.
        const filledComment: ReturnCommentsWithPostInfoEntity = {
          id: comment.id,
          content: comment.content,
          createdAt: comment.createdAt,
          commentatorInfo: {
            userId: comment.commentatorInfoUserId,
            userLogin: comment.commentatorInfoUserLogin,
          },
          likesInfo: {
            likesCount,
            dislikesCount,
            myStatus: ownLikeStatus,
          },
          postInfo: {
            id: comment.postInfoPostId,
            title: comment.postInfoTitle,
            blogId: comment.postInfoBlogId,
            blogName: comment.postInfoBlogName,
          },
        };

        filledComments.push(filledComment);
      }

      // Return the list of filled comments.
      return filledComments;
    } catch (error) {
      console.error(error.message);
      throw new InternalServerErrorException('Error filling comments data.');
    }
  }

  private async getLikesDislikesCount(
    commentId: string,
    isBanned: boolean,
    likeStatus: 'Like' | 'Dislike',
  ): Promise<number> {
    return this.likeStatusCommentsRawSqlRepository.countLikesDislikes(
      commentId,
      isBanned,
      likeStatus,
    );
  }
}

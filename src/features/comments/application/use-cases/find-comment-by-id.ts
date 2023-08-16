import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { CommentsRawSqlRepository } from '../../infrastructure/comments-raw-sql.repository';
import { ReturnCommentsEntity } from '../../entities/return-comments.entity';
import { NotFoundException } from '@nestjs/common';
import { CommentsCountLikesDislikesEntity } from '../../entities/comments-count-likes-dislikes.entity';

export class FindCommentByIdCommand {
  constructor(
    public commentId: string,
    public currentUserDto: CurrentUserDto | null,
  ) {}
}

@CommandHandler(FindCommentByIdCommand)
export class FindCommentByIdUseCase
  implements ICommandHandler<FindCommentByIdCommand>
{
  constructor(
    protected commandBus: CommandBus,
    protected commentsRawSqlRepository: CommentsRawSqlRepository,
  ) {}
  async execute(
    command: FindCommentByIdCommand,
  ): Promise<ReturnCommentsEntity> {
    const { commentId, currentUserDto } = command;

    const comment: CommentsCountLikesDislikesEntity | null =
      await this.commentsRawSqlRepository.findCommentByIdAndCountOfLikesDislikesComment(
        commentId,
        currentUserDto,
      );

    if (!comment)
      throw new NotFoundException(`Comment with id: ${commentId} not found.`);

    return {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      commentatorInfo: {
        userId: comment.commentatorInfoUserId,
        userLogin: comment.commentatorInfoUserLogin,
      },
      likesInfo: {
        likesCount: comment.countLikes,
        dislikesCount: comment.countDislikes,
        myStatus: comment.likeStatus,
      },
    };
  }
}

import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { CommentsRawSqlRepository } from '../../infrastructure/comments-raw-sql.repository';
import { ReturnCommentsEntity } from '../../entities/return-comments.entity';
import { TablesCommentsCountOfLikesDislikesComments } from '../../entities/comment-by-id-count-likes-dislikes';
import { NotFoundException } from '@nestjs/common';

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

    const comment: TablesCommentsCountOfLikesDislikesComments | null =
      await this.commentsRawSqlRepository.findCommentByIdAndCountOfLikesDislikesComments(
        commentId,
        currentUserDto,
      );

    if (!comment) throw new NotFoundException('Not found comment.');

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
        myStatus: comment.myStatus,
      },
    };
  }
}

import { LikeStatusDto } from '../../dto/like-status.dto';
import { NotFoundException } from '@nestjs/common';
import { LikeStatusCommentEntity } from '../../entities/like-status-comment.entity';
import { LikeStatusCommentsRepository } from '../../infrastructure/like-status-comments.repository';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';

export class ChangeLikeStatusCommentCommand {
  constructor(
    public commentId: string,
    public likeStatusDto: LikeStatusDto,
    public currentUserDto: CurrentUserDto,
  ) {}
}

@CommandHandler(ChangeLikeStatusCommentCommand)
export class ChangeLikeStatusCommentUseCase
  implements ICommandHandler<ChangeLikeStatusCommentCommand>
{
  constructor(
    protected commentsRepository: CommentsRepository,
    protected likeStatusCommentsRepository: LikeStatusCommentsRepository,
  ) {}
  async execute(command: ChangeLikeStatusCommentCommand): Promise<boolean> {
    const findComment = await this.commentsRepository.findCommentById(
      command.commentId,
    );
    if (!findComment) throw new NotFoundException();
    const likeStatusCommEntity: LikeStatusCommentEntity = {
      blogId: findComment.postInfo.blogId,
      commentId: command.commentId,
      userId: command.currentUserDto.id,
      isBanned: command.currentUserDto.isBanned,
      likeStatus: command.likeStatusDto.likeStatus,
      createdAt: new Date().toISOString(),
    };
    return await this.likeStatusCommentsRepository.updateLikeStatusComment(
      likeStatusCommEntity,
    );
  }
}

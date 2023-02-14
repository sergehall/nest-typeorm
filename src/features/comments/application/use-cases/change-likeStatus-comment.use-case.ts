import { LikeStatusDto } from '../../dto/like-status.dto';
import { UsersEntity } from '../../../users/entities/users.entity';
import { NotFoundException } from '@nestjs/common';
import { LikeStatusCommentEntity } from '../../entities/like-status-comment.entity';
import { LikeStatusCommentsRepository } from '../../infrastructure/like-status-comments.repository';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class ChangeLikeStatusCommentCommand {
  constructor(
    public commentId: string,
    public likeStatusDto: LikeStatusDto,
    public currentUser: UsersEntity,
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
      blogId: findComment.blogId,
      commentId: command.commentId,
      userId: command.currentUser.id,
      isBanned: command.currentUser.banInfo.isBanned,
      likeStatus: command.likeStatusDto.likeStatus,
      createdAt: new Date().toISOString(),
    };
    return await this.likeStatusCommentsRepository.updateLikeStatusComment(
      likeStatusCommEntity,
    );
  }
}

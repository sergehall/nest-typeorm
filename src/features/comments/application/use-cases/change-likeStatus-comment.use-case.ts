import { LikeStatusDto } from '../../dto/like-status.dto';
import { NotFoundException } from '@nestjs/common';
import { LikeStatusCommentEntity } from '../../entities/like-status-comment.entity';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { CommentsRawSqlRepository } from '../../infrastructure/comments-raw-sql.repository';
import { LikeStatusCommentsRawSqlRepository } from '../../infrastructure/like-status-comments-raw-sql.repository';

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
    protected commentsRawSqlRepository: CommentsRawSqlRepository,
    protected likeStatusCommentsRawSqlRepository: LikeStatusCommentsRawSqlRepository,
  ) {}
  async execute(command: ChangeLikeStatusCommentCommand): Promise<boolean> {
    const findComment =
      await this.commentsRawSqlRepository.findCommentByCommentId(
        command.commentId,
      );
    if (!findComment) throw new NotFoundException();
    const likeStatusCommEntity: LikeStatusCommentEntity = {
      blogId: findComment.postInfoBlogId,
      commentId: command.commentId,
      userId: command.currentUserDto.id,
      isBanned: command.currentUserDto.isBanned,
      likeStatus: command.likeStatusDto.likeStatus,
      createdAt: new Date().toISOString(),
    };
    return await this.likeStatusCommentsRawSqlRepository.updateLikeStatusComment(
      likeStatusCommEntity,
    );
  }
}

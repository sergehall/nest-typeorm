import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikeStatusCommentsRepository } from '../../infrastructure/like-status-comments.repository';
import { CommentsRepository } from '../../infrastructure/comments.repository';

export class ChangeBanStatusCommentsByUserIdBlogIdCommand {
  constructor(
    public userId: string,
    public blogId: string,
    public isBanned: boolean,
  ) {}
}

@CommandHandler(ChangeBanStatusCommentsByUserIdBlogIdCommand)
export class ChangeBanStatusCommentsByUserIdBlogIdUseCase
  implements ICommandHandler<ChangeBanStatusCommentsByUserIdBlogIdCommand>
{
  constructor(
    protected likeStatusCommentsRepository: LikeStatusCommentsRepository,
    protected commentsRepository: CommentsRepository,
  ) {}
  async execute(
    command: ChangeBanStatusCommentsByUserIdBlogIdCommand,
  ): Promise<boolean> {
    await this.commentsRepository.changeBanStatusCommentsByUserIdAndBlogId(
      command.userId,
      command.blogId,
      command.isBanned,
    );
    await this.likeStatusCommentsRepository.changeBanStatusCommentsLikeByUserIdBlogId(
      command.userId,
      command.blogId,
      command.isBanned,
    );
    return true;
  }
}

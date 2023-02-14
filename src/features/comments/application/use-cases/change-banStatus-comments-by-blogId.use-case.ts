import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikeStatusCommentsRepository } from '../../infrastructure/like-status-comments.repository';
import { CommentsRepository } from '../../infrastructure/comments.repository';

export class ChangeBanStatusCommentsByBlogIdCommand {
  constructor(
    public userId: string,
    public blogId: string,
    public isBanned: boolean,
  ) {}
}

@CommandHandler(ChangeBanStatusCommentsByBlogIdCommand)
export class ChangeBanStatusCommentsByBlogIdUseCase
  implements ICommandHandler<ChangeBanStatusCommentsByBlogIdCommand>
{
  constructor(
    protected likeStatusCommentsRepository: LikeStatusCommentsRepository,
    protected commentsRepository: CommentsRepository,
  ) {}
  async execute(
    command: ChangeBanStatusCommentsByBlogIdCommand,
  ): Promise<boolean> {
    await this.commentsRepository.changeBanStatusCommentsByUserIdAndBlogId(
      command.userId,
      command.blogId,
      command.isBanned,
    );
    await this.likeStatusCommentsRepository.changeBanStatusCommentsLikeByBlogId(
      command.userId,
      command.blogId,
      command.isBanned,
    );
    return true;
  }
}

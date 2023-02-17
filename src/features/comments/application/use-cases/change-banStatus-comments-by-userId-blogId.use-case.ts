import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikeStatusCommentsRepository } from '../../infrastructure/like-status-comments.repository';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { BanInfo } from '../../../blogger-blogs/entities/blogger-blogs-banned-users.entity';

export class ChangeBanStatusCommentsByUserIdBlogIdCommand {
  constructor(
    public userId: string,
    public blogId: string,
    public banInfo: BanInfo,
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
      command.banInfo,
    );
    await this.likeStatusCommentsRepository.changeBanStatusCommentsLikeByUserIdBlogId(
      command.userId,
      command.blogId,
      command.banInfo.isBanned,
    );
    return true;
  }
}

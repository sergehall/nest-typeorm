import { BanInfo } from '../../../blogger-blogs/entities/blogger-blogs-banned-users.entity';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikeStatusCommentsRepository } from '../../infrastructure/like-status-comments.repository';
import { CommentsRepository } from '../../infrastructure/comments.repository';

export class ChangeBanStatusCommentsByBlogIdCommand {
  constructor(public blogId: string, public banInfo: BanInfo) {}
}
@CommandHandler(ChangeBanStatusCommentsByBlogIdCommand)
export class ChangeBanStatusCommentsByBlogIdUseCase
  implements ICommandHandler<ChangeBanStatusCommentsByBlogIdCommand>
{
  constructor(
    protected likeStatusCommentsRepository: LikeStatusCommentsRepository,
    protected commentsRepository: CommentsRepository,
  ) {}
  async execute(command: ChangeBanStatusCommentsByBlogIdCommand) {
    await this.commentsRepository.changeBanStatusCommentsByBlogId(
      command.blogId,
      command.banInfo.isBanned,
    );
    await this.likeStatusCommentsRepository.changeBanStatusCommentsLikeByBlogId(
      command.blogId,
      command.banInfo.isBanned,
    );
    return;
  }
}

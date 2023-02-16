import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikeStatusCommentsRepository } from '../../infrastructure/like-status-comments.repository';
import { CommentsRepository } from '../../infrastructure/comments.repository';

export class ChangeBanStatusUserCommentsCommand {
  constructor(public userId: string, public isBanned: boolean) {}
}

@CommandHandler(ChangeBanStatusUserCommentsCommand)
export class ChangeBanStatusCommentsUseCase
  implements ICommandHandler<ChangeBanStatusUserCommentsCommand>
{
  constructor(
    protected likeStatusCommentsRepository: LikeStatusCommentsRepository,
    protected commentsRepository: CommentsRepository,
  ) {}
  async execute(command: ChangeBanStatusUserCommentsCommand): Promise<boolean> {
    await this.commentsRepository.changeBanStatusCommentsByUserId(
      command.userId,
      command.isBanned,
    );
    await this.likeStatusCommentsRepository.changeBanStatusCommentsLike(
      command.userId,
      command.isBanned,
    );
    return true;
  }
}

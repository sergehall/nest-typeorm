import { ICommandHandler } from '@nestjs/cqrs';
import { LikeStatusCommentsRepository } from '../../infrastructure/like-status-comments.repository';

export class ChangeBanStatusCommentsCommand {
  constructor(public userId: string, public isBanned: boolean) {}
}
export class ChangeBanStatusCommentsUseCase
  implements ICommandHandler<ChangeBanStatusCommentsCommand>
{
  constructor(
    protected likeStatusCommentsRepository: LikeStatusCommentsRepository,
  ) {}
  async execute(command: ChangeBanStatusCommentsCommand): Promise<boolean> {
    return await this.likeStatusCommentsRepository.changeBanStatusComments(
      command.userId,
      command.isBanned,
    );
  }
}

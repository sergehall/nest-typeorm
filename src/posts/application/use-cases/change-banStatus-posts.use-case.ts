import { PostsRepository } from '../../infrastructure/posts.repository';
import { LikeStatusPostsRepository } from '../../infrastructure/like-status-posts.repository';
import { ICommandHandler } from '@nestjs/cqrs';

export class ChangeBanStatusPostsCommand {
  constructor(public userId: string, public isBanned: boolean) {}
}
export class ChangeBanStatusPostsUseCase
  implements ICommandHandler<ChangeBanStatusPostsCommand>
{
  constructor(
    protected postsRepository: PostsRepository,
    protected likeStatusPostsRepository: LikeStatusPostsRepository,
  ) {}
  async execute(command: ChangeBanStatusPostsCommand): Promise<boolean> {
    await this.postsRepository.changeBanStatusPostRepo(
      command.userId,
      command.isBanned,
    );
    await this.likeStatusPostsRepository.changeBanStatusPostsInLikeStatusRepo(
      command.userId,
      command.isBanned,
    );
    return true;
  }
}

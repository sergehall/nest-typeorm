import { PostsRepository } from '../../infrastructure/posts.repository';
import { LikeStatusPostsRepository } from '../../infrastructure/like-status-posts.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class ChangeBanStatusUserPostsCommand {
  constructor(public userId: string, public isBanned: boolean) {}
}

@CommandHandler(ChangeBanStatusUserPostsCommand)
export class ChangeBanStatusPostsUseCase
  implements ICommandHandler<ChangeBanStatusUserPostsCommand>
{
  constructor(
    protected postsRepository: PostsRepository,
    protected likeStatusPostsRepository: LikeStatusPostsRepository,
  ) {}
  async execute(command: ChangeBanStatusUserPostsCommand): Promise<boolean> {
    await this.postsRepository.changeBanStatusUserPosts(
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

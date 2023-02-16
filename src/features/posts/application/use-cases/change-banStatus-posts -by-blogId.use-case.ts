import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { LikeStatusPostsRepository } from '../../infrastructure/like-status-posts.repository';
import { BanInfo } from '../../../blogger-blogs/entities/blogger-blogs-banned-users.entity';

export class ChangeBanStatusPostsByBlogIdCommand {
  constructor(public blogId: string, public banInfo: BanInfo) {}
}

@CommandHandler(ChangeBanStatusPostsByBlogIdCommand)
export class ChangeBanStatusPostsByBlogIdUseCase
  implements ICommandHandler<ChangeBanStatusPostsByBlogIdCommand>
{
  constructor(
    protected postsRepository: PostsRepository,
    protected likeStatusPostsRepository: LikeStatusPostsRepository,
  ) {}
  async execute(
    command: ChangeBanStatusPostsByBlogIdCommand,
  ): Promise<boolean> {
    await this.postsRepository.changeBanStatusPostByBlogId(
      command.blogId,
      command.banInfo,
    );
    await this.likeStatusPostsRepository.changeBanStatusPostsLikeStatusByBlogId(
      command.blogId,
      command.banInfo.isBanned,
    );
    return true;
  }
}

import { PostsRepository } from '../../infrastructure/posts.repository';
import { LikeStatusPostsRepository } from '../../infrastructure/like-status-posts.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateBanUserDto } from '../../../blogger-blogs/dto/update-ban-user.dto';

export class ChangeBanStatusPostsByBlogIdCommand {
  constructor(
    public userId: string,
    public updateBanUserDto: UpdateBanUserDto,
  ) {}
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
      command.userId,
      command.updateBanUserDto,
    );
    await this.likeStatusPostsRepository.changeBanStatusPostsLikeStatusByBlogId(
      command.userId,
      command.updateBanUserDto.blogId,
      command.updateBanUserDto.isBanned,
    );
    return true;
  }
}

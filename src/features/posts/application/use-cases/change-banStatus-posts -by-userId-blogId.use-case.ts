import { PostsRepository } from '../../infrastructure/posts.repository';
import { LikeStatusPostsRepository } from '../../infrastructure/like-status-posts.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateBanUserDto } from '../../../blogger-blogs/dto/update-ban-user.dto';

export class ChangeBanStatusPostsByUserIdBlogIdCommand {
  constructor(
    public userId: string,
    public updateBanUserDto: UpdateBanUserDto,
  ) {}
}

@CommandHandler(ChangeBanStatusPostsByUserIdBlogIdCommand)
export class ChangeBanStatusPostsByUserIdBlogIdUseCase
  implements ICommandHandler<ChangeBanStatusPostsByUserIdBlogIdCommand>
{
  constructor(
    protected postsRepository: PostsRepository,
    protected likeStatusPostsRepository: LikeStatusPostsRepository,
  ) {}
  async execute(
    command: ChangeBanStatusPostsByUserIdBlogIdCommand,
  ): Promise<boolean> {
    await this.postsRepository.changeBanStatusPostsByUserIdBlogId(
      command.userId,
      command.updateBanUserDto,
    );
    await this.likeStatusPostsRepository.changeBanStatusPostsLikeStatusByUserIdBlogId(
      command.userId,
      command.updateBanUserDto.blogId,
      command.updateBanUserDto.isBanned,
    );
    return true;
  }
}

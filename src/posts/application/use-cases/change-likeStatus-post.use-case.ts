import { LikeStatusDto } from '../../../comments/dto/like-status.dto';
import { UsersEntity } from '../../../users/entities/users.entity';
import { NotFoundException } from '@nestjs/common';
import { LikeStatusPostEntity } from '../../entities/like-status-post.entity';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { LikeStatusPostsRepository } from '../../infrastructure/like-status-posts.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class ChangeLikeStatusPostCommand {
  constructor(
    public postId: string,
    public likeStatusDto: LikeStatusDto,
    public currentUser: UsersEntity,
  ) {}
}

@CommandHandler(ChangeLikeStatusPostCommand)
export class ChangeLikeStatusPostUseCase
  implements ICommandHandler<ChangeLikeStatusPostCommand>
{
  constructor(
    protected postsRepository: PostsRepository,
    protected likeStatusPostsRepository: LikeStatusPostsRepository,
  ) {}
  async execute(command: ChangeLikeStatusPostCommand) {
    const post = await this.postsRepository.findPostById(command.postId);
    if (!post) throw new NotFoundException();
    const likeStatusPostEntity: LikeStatusPostEntity = {
      postId: command.postId,
      userId: command.currentUser.id,
      login: command.currentUser.login,
      isBanned: command.currentUser.banInfo.isBanned,
      likeStatus: command.likeStatusDto.likeStatus,
      addedAt: new Date().toISOString(),
    };
    return await this.likeStatusPostsRepository.updateLikeStatusPost(
      likeStatusPostEntity,
    );
  }
}

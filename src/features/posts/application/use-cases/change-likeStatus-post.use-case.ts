import { LikeStatusDto } from '../../../comments/dto/like-status.dto';
import { NotFoundException } from '@nestjs/common';
import { LikeStatusPostEntity } from '../../entities/like-status-post.entity';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { LikeStatusPostsRepository } from '../../infrastructure/like-status-posts.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';

export class ChangeLikeStatusPostCommand {
  constructor(
    public postId: string,
    public likeStatusDto: LikeStatusDto,
    public currentUserDto: CurrentUserDto,
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
      blogId: post.blogId,
      postId: command.postId,
      userId: command.currentUserDto.id,
      login: command.currentUserDto.login,
      isBanned: command.currentUserDto.isBanned,
      likeStatus: command.likeStatusDto.likeStatus,
      addedAt: new Date().toISOString(),
    };
    return await this.likeStatusPostsRepository.updateLikeStatusPost(
      likeStatusPostEntity,
    );
  }
}

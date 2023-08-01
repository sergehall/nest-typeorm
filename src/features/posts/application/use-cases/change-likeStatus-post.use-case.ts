import { LikeStatusDto } from '../../../comments/dto/like-status.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { LikeStatusPostEntity } from '../../entities/like-status-post.entity';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { PostsRawSqlRepository } from '../../infrastructure/posts-raw-sql.repository';
import { PostsRawSqlEntity } from '../../entities/posts-raw-sql.entity';
import { LikeStatusPostsRawSqlRepository } from '../../infrastructure/like-status-posts-raw-sql.repository';
import { BannedUsersForBlogsRawSqlRepository } from '../../../users/infrastructure/banned-users-for-blogs-raw-sql.repository';

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
    protected likeStatusPostsRawSqlRepository: LikeStatusPostsRawSqlRepository,
    protected bannedUsersForBlogsRawSqlRepository: BannedUsersForBlogsRawSqlRepository,
    protected postsRawSqlRepository: PostsRawSqlRepository,
  ) {}
  async execute(command: ChangeLikeStatusPostCommand) {
    const post: PostsRawSqlEntity | null =
      await this.postsRawSqlRepository.findPostByPostId(command.postId);
    if (!post) throw new NotFoundException('Not found post.');

    const isBannedCurrentUser =
      await this.bannedUsersForBlogsRawSqlRepository.existenceBannedUser(
        command.currentUserDto.id,
        post.blogId,
      );
    if (isBannedCurrentUser) {
      throw new ForbiddenException('You are not allowed to like this post.');
    }

    const likeStatusPostEntity: LikeStatusPostEntity = {
      blogId: post.blogId,
      postOwnerId: post.postOwnerId,
      postId: command.postId,
      userId: command.currentUserDto.id,
      login: command.currentUserDto.login,
      isBanned: command.currentUserDto.isBanned,
      likeStatus: command.likeStatusDto.likeStatus,
      addedAt: new Date().toISOString(),
    };
    return await this.likeStatusPostsRawSqlRepository.updateLikeStatusPosts(
      likeStatusPostEntity,
    );
  }
}

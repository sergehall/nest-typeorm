import { LikeStatusDto } from '../../../comments/dto/like-status.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../../users/dto/current-user.dto';
import { userNotHavePermissionForBlog } from '../../../../common/filters/custom-errors-messages';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import { PostsRepo } from '../../infrastructure/posts-repo';
import { PostsEntity } from '../../entities/posts.entity';
import { LikeStatusPostsRepo } from '../../infrastructure/like-status-posts.repo';
import { LikeStatusPostsEntity } from '../../entities/like-status-posts.entity';
import { BannedUsersForBlogsRepo } from '../../../users/infrastructure/banned-users-for-blogs.repo';

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
    protected caslAbilityFactory: CaslAbilityFactory,
    protected likeStatusPostsRepo: LikeStatusPostsRepo,
    protected bannedUsersForBlogsRepo: BannedUsersForBlogsRepo,
    protected postsRepo: PostsRepo,
  ) {}
  async execute(
    command: ChangeLikeStatusPostCommand,
  ): Promise<LikeStatusPostsEntity> {
    const { postId, likeStatusDto, currentUserDto } = command;

    const post: PostsEntity | null =
      await this.postsRepo.getPostByIdWithoutLikes(postId);
    if (!post) throw new NotFoundException(`Post with ID ${postId} not found`);

    await this.checkUserPermission(post, currentUserDto);

    return await this.likeStatusPostsRepo.updateOrCreateLikeStatusPosts(
      post,
      likeStatusDto,
      currentUserDto,
    );
  }

  private async checkUserPermission(
    post: PostsEntity,
    currentUserDto: CurrentUserDto,
  ) {
    const userIsBannedForBlog = await this.bannedUsersForBlogsRepo.userIsBanned(
      currentUserDto.userId,
      post.blog.id,
    );
    if (userIsBannedForBlog)
      throw new ForbiddenException(userNotHavePermissionForBlog);
  }
}

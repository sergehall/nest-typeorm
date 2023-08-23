import { LikeStatusDto } from '../../../comments/dto/like-status.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { PostsRawSqlRepository } from '../../infrastructure/posts-raw-sql.repository';
import { LikeStatusPostsRawSqlRepository } from '../../infrastructure/like-status-posts-raw-sql.repository';
import { BannedUsersForBlogsRawSqlRepository } from '../../../users/infrastructure/banned-users-for-blogs-raw-sql.repository';
import { TablesPostsEntity } from '../../entities/tables-posts-entity';
import { userNotHavePermissionForBlog } from '../../../../common/filters/custom-errors-messages';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';

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
    protected likeStatusPostsRawSqlRepository: LikeStatusPostsRawSqlRepository,
    protected bannedUsersForBlogsRawSqlRepository: BannedUsersForBlogsRawSqlRepository,
    protected postsRawSqlRepository: PostsRawSqlRepository,
  ) {}
  async execute(command: ChangeLikeStatusPostCommand): Promise<boolean> {
    const { postId, likeStatusDto, currentUserDto } = command;

    const post: TablesPostsEntity | null =
      await this.postsRawSqlRepository.getPostById(postId);
    if (!post) throw new NotFoundException('Not found post.');

    await this.checkUserPermission(post, currentUserDto);

    return await this.likeStatusPostsRawSqlRepository.updateLikeStatusPosts(
      post,
      likeStatusDto,
      currentUserDto,
    );
  }

  private async checkUserPermission(
    post: TablesPostsEntity,
    currentUserDto: CurrentUserDto,
  ) {
    const userIsBannedForBlog =
      await this.bannedUsersForBlogsRawSqlRepository.userIsBanned(
        currentUserDto.userId,
        post.blogId,
      );
    if (userIsBannedForBlog)
      throw new ForbiddenException(userNotHavePermissionForBlog);
  }
}

import { LikeStatusDto } from '../../../comments/dto/like-status.dto';
import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { TablesLikeStatusPostEntity } from '../../entities/tables-like-status-post.entity';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { PostsRawSqlRepository } from '../../infrastructure/posts-raw-sql.repository';
import { LikeStatusPostsRawSqlRepository } from '../../infrastructure/like-status-posts-raw-sql.repository';
import { BannedUsersForBlogsRawSqlRepository } from '../../../users/infrastructure/banned-users-for-blogs-raw-sql.repository';
import { TablesPostsEntity } from '../../entities/tables-posts-entity';
import { userNotHavePermissionForBlog } from '../../../../exception-filter/custom-errors-messages';

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
  async execute(command: ChangeLikeStatusPostCommand): Promise<boolean> {
    const post: TablesPostsEntity | null =
      await this.postsRawSqlRepository.findPostByPostId(command.postId);
    if (!post) throw new NotFoundException('Not found post.');

    // Check if the user is banned from posting in this blog
    const userIsBannedForBlog =
      await this.bannedUsersForBlogsRawSqlRepository.userIsBanned(
        command.currentUserDto.id,
        post.blogId,
      );
    if (userIsBannedForBlog)
      throw new HttpException(
        { message: userNotHavePermissionForBlog },
        HttpStatus.BAD_REQUEST,
      );

    const likeStatusPostEntity: TablesLikeStatusPostEntity = {
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

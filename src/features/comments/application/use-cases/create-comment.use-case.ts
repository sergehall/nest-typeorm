import { CreateCommentDto } from '../../dto/create-comment.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { PostsRawSqlRepository } from '../../../posts/infrastructure/posts-raw-sql.repository';
import { CommentsRawSqlRepository } from '../../infrastructure/comments-raw-sql.repository';
import { ReturnCommentsEntity } from '../../entities/return-comments.entity';
import { userNotHavePermissionForBlog } from '../../../../common/filters/custom-errors-messages';
import { BannedUsersForBlogsRawSqlRepository } from '../../../users/infrastructure/banned-users-for-blogs-raw-sql.repository';

export class CreateCommentCommand {
  constructor(
    public postId: string,
    public createCommentDto: CreateCommentDto,
    public currentUserDto: CurrentUserDto,
  ) {}
}
@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase
  implements ICommandHandler<CreateCommentCommand>
{
  constructor(
    protected postsRawSqlRepository: PostsRawSqlRepository,
    protected commentsRawSqlRepository: CommentsRawSqlRepository,
    protected bannedUsersForBlogsRawSqlRepository: BannedUsersForBlogsRawSqlRepository,
  ) {}
  async execute(command: CreateCommentCommand): Promise<ReturnCommentsEntity> {
    const { postId, createCommentDto, currentUserDto } = command;

    const post = await this.postsRawSqlRepository.getPostById(postId);
    if (!post) throw new NotFoundException('Not found post.');

    await this.checkUserPermission(currentUserDto.id, post.blogId);

    return await this.commentsRawSqlRepository.createComment(
      post,
      createCommentDto,
      currentUserDto,
    );
  }
  private async checkUserPermission(
    userId: string,
    blogId: string,
  ): Promise<void> {
    const userIsBannedForBlog =
      await this.bannedUsersForBlogsRawSqlRepository.userIsBanned(
        userId,
        blogId,
      );
    if (userIsBannedForBlog)
      throw new ForbiddenException(userNotHavePermissionForBlog);
  }
}

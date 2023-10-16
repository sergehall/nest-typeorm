import { CreateCommentDto } from '../../dto/create-comment.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { userNotHavePermissionForBlog } from '../../../../common/filters/custom-errors-messages';
import { BannedUsersForBlogsRawSqlRepository } from '../../../users/infrastructure/banned-users-for-blogs-raw-sql.repository';
import { PostsRepo } from '../../../posts/infrastructure/posts-repo';
import { CommentsRepo } from '../../infrastructure/comments.repo';
import { CommentViewModel } from '../../view-models/comment.view-model';

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
    protected postsRepo: PostsRepo,
    protected commentsRepo: CommentsRepo,
    protected bannedUsersForBlogsRawSqlRepository: BannedUsersForBlogsRawSqlRepository,
  ) {}
  async execute(command: CreateCommentCommand): Promise<CommentViewModel> {
    const { postId, createCommentDto, currentUserDto } = command;

    const post = await this.postsRepo.getPostByIdWithoutLikes(postId);
    if (!post) throw new NotFoundException('Not found post.');

    await this.checkUserPermission(currentUserDto.userId, post.blog.id);

    return await this.commentsRepo.createComments(
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

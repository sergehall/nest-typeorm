import { CreateCommentDto } from '../../dto/create-comment.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../../users/dto/current-user.dto';
import { userNotHavePermissionForBlog } from '../../../../common/filters/custom-errors-messages';
import { PostsRepo } from '../../../posts/infrastructure/posts-repo';
import { CommentsRepo } from '../../infrastructure/comments.repo';
import { CommentViewModel } from '../../views/comment.view-model';
import { BannedUsersForBlogsRepo } from '../../../users/infrastructure/banned-users-for-blogs.repo';
import { PostsEntity } from '../../../posts/entities/posts.entity';

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
    protected bannedUsersForBlogsRepo: BannedUsersForBlogsRepo,
  ) {}
  async execute(command: CreateCommentCommand): Promise<CommentViewModel> {
    const { postId, createCommentDto, currentUserDto } = command;

    const post: PostsEntity | null =
      await this.postsRepo.getPostByIdWithoutLikes(postId);

    if (!post) throw new NotFoundException(`Post with ID ${postId} not found`);

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
    const userIsBannedForBlog = await this.bannedUsersForBlogsRepo.userIsBanned(
      userId,
      blogId,
    );
    if (userIsBannedForBlog)
      throw new ForbiddenException(userNotHavePermissionForBlog);
  }
}

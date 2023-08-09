import { CreateCommentDto } from '../../dto/create-comment.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import * as uuid4 from 'uuid4';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { PostsRawSqlRepository } from '../../../posts/infrastructure/posts-raw-sql.repository';
import { BloggerBlogsRawSqlRepository } from '../../../blogger-blogs/infrastructure/blogger-blogs-raw-sql.repository';
import { CommentsRawSqlRepository } from '../../infrastructure/comments-raw-sql.repository';
import { ReturnCommentsEntity } from '../../entities/return-comments.entity';
import { userNotHavePermissionForBlog } from '../../../../exception-filter/custom-errors-messages';
import { BannedUsersForBlogsRawSqlRepository } from '../../../users/infrastructure/banned-users-for-blogs-raw-sql.repository';
import { LikeStatusEnums } from '../../../../config/db/mongo/enums/like-status.enums';
import { TablesCommentsEntity } from '../../entities/tables-comments.entity';

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
    protected bloggerBlogsRawSqlRepository: BloggerBlogsRawSqlRepository,
    protected commentsRawSqlRepository: CommentsRawSqlRepository,
    protected bannedUsersForBlogsRawSqlRepository: BannedUsersForBlogsRawSqlRepository,
  ) {}
  async execute(command: CreateCommentCommand): Promise<ReturnCommentsEntity> {
    const { postId, createCommentDto, currentUserDto } = command;

    const post = await this.postsRawSqlRepository.getPostById(postId);
    if (!post) throw new NotFoundException('Not found post.');

    const userIsBannedForBlog =
      await this.bannedUsersForBlogsRawSqlRepository.userIsBanned(
        currentUserDto.id,
        post.blogId,
      );
    if (userIsBannedForBlog)
      throw new ForbiddenException(userNotHavePermissionForBlog);

    const newComment: TablesCommentsEntity[] =
      await this.commentsRawSqlRepository.createComment({
        id: uuid4().toString(),
        content: createCommentDto.content,
        createdAt: new Date().toISOString(),
        postInfoPostId: post.id,
        postInfoTitle: post.title,
        postInfoBlogId: post.blogId,
        postInfoBlogName: post.blogName,
        postInfoBlogOwnerId: post.postOwnerId,
        commentatorInfoUserId: currentUserDto.id,
        commentatorInfoUserLogin: currentUserDto.login,
        commentatorInfoIsBanned: false,
        banInfoIsBanned: false,
        banInfoBanDate: null,
        banInfoBanReason: null,
      });
    console.log(newComment);
    return {
      id: newComment[0].id,
      content: newComment[0].content,
      createdAt: newComment[0].createdAt,
      commentatorInfo: {
        userId: newComment[0].commentatorInfoUserId,
        userLogin: newComment[0].commentatorInfoUserLogin,
      },
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatusEnums.NONE,
      },
    };
  }
}

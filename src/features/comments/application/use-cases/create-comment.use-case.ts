import { CreateCommentDto } from '../../dto/create-comment.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import * as uuid4 from 'uuid4';
import { StatusLike } from '../../../../config/db/mongo/enums/like-status.enums';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { PostsRawSqlRepository } from '../../../posts/infrastructure/posts-raw-sql.repository';
import { BloggerBlogsRawSqlRepository } from '../../../blogger-blogs/infrastructure/blogger-blogs-raw-sql.repository';
import { TablesCommentsRawSqlEntity } from '../../entities/tables-comments-raw-sql.entity';
import { CommentsRawSqlRepository } from '../../infrastructure/comments-raw-sql.repository';
import { ReturnCommentsEntity } from '../../entities/return-comments.entity';

export class CreateCommentCommand {
  constructor(
    public postId: string,
    public createCommentDto: CreateCommentDto,
    public currentUser: CurrentUserDto,
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
  ) {}
  async execute(command: CreateCommentCommand): Promise<ReturnCommentsEntity> {
    const post = await this.postsRawSqlRepository.findPostByPostId(
      command.postId,
    );
    if (!post) throw new NotFoundException('Not found post.');

    const isBannedUserForBlog =
      await this.bloggerBlogsRawSqlRepository.isBannedUserForBlog(
        command.currentUser.id,
        post.blogId,
      );
    if (isBannedUserForBlog)
      throw new ForbiddenException(
        'You are not allowed to create comment for this blog.',
      );

    const newComment: TablesCommentsRawSqlEntity[] =
      await this.commentsRawSqlRepository.createComment({
        id: uuid4().toString(),
        content: command.createCommentDto.content,
        createdAt: new Date().toISOString(),
        postInfoPostId: post.id,
        postInfoTitle: post.title,
        postInfoBlogId: post.blogId,
        postInfoBlogName: post.blogName,
        postInfoBlogOwnerId: post.postOwnerId,
        commentatorInfoUserId: command.currentUser.id,
        commentatorInfoUserLogin: command.currentUser.login,
        commentatorInfoIsBanned: false,
        banInfoIsBanned: false,
        banInfoBanDate: null,
        banInfoBanReason: null,
      });

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
        myStatus: StatusLike.NONE,
      },
    };
  }
}

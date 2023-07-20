import { CreateCommentDto } from '../../dto/create-comment.dto';
import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as uuid4 from 'uuid4';
import { StatusLike } from '../../../../infrastructure/database/enums/like-status.enums';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsReturnEntity } from '../../entities/comments-return.entity';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { PostsRawSqlRepository } from '../../../posts/infrastructure/posts-raw-sql.repository';
import { BloggerBlogsRawSqlRepository } from '../../../blogger-blogs/infrastructure/blogger-blogs-raw-sql.repository';
import { TablesCommentsRawSqlEntity } from '../../entities/tables-comments-raw-sql.entity';
import { CommentsRawSqlRepository } from '../../infrastructure/comments-raw-sql.repository';

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
  async execute(command: CreateCommentCommand): Promise<CommentsReturnEntity> {
    const post = await this.postsRawSqlRepository.findPostByPostId(
      command.postId,
    );
    if (!post) throw new NotFoundException();
    const isBannedUserForBlog =
      await this.bloggerBlogsRawSqlRepository.isBannedUserForBlog(
        command.currentUser.id,
        post.blogId,
      );
    if (isBannedUserForBlog) throw new ForbiddenException();
    const newComment: TablesCommentsRawSqlEntity = {
      id: uuid4().toString(),
      content: command.createCommentDto.content,
      createdAt: new Date().toISOString(),
      postInfoId: post.id,
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
    };
    const createComment = await this.commentsRawSqlRepository.createComment(
      newComment,
    );
    if (!createComment) throw new InternalServerErrorException();
    return {
      id: createComment.id,
      content: createComment.content,
      createdAt: createComment.createdAt,
      commentatorInfo: {
        userId: createComment.commentatorInfoUserId,
        userLogin: createComment.commentatorInfoUserLogin,
      },
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: StatusLike.NONE,
      },
    };
  }
}

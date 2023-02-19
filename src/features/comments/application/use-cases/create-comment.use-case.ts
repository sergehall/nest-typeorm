import { CreateCommentDto } from '../../dto/create-comment.dto';
import { CommentsEntity } from '../../entities/comments.entity';
import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as uuid4 from 'uuid4';
import { StatusLike } from '../../../../infrastructure/database/enums/like-status.enums';
import { PostsService } from '../../../posts/application/posts.service';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsReturnEntity } from '../../entities/comments-return.entity';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { BloggerBlogsRepository } from '../../../blogger-blogs/infrastructure/blogger-blogs.repository';

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
    protected postsService: PostsService,
    protected commentsRepository: CommentsRepository,
    protected bloggerBlogsRepository: BloggerBlogsRepository,
  ) {}
  async execute(command: CreateCommentCommand): Promise<CommentsReturnEntity> {
    const post = await this.postsService.checkPostInDB(command.postId);
    if (!post) throw new NotFoundException();
    const isBannedUserForBlog =
      await this.bloggerBlogsRepository.isBannedUserForBlog(
        command.currentUser.id,
        post.blogId,
      );
    if (isBannedUserForBlog) throw new ForbiddenException();
    const newComment: CommentsEntity = {
      id: uuid4().toString(),
      content: command.createCommentDto.content,
      createdAt: new Date().toISOString(),
      postInfo: {
        id: post.id,
        title: post.title,
        blogId: post.blogId,
        blogName: post.blogName,
        blogOwnerId: post.postOwnerInfo.userId,
      },
      commentatorInfo: {
        userId: command.currentUser.id,
        userLogin: command.currentUser.login,
        isBanned: false,
      },
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: StatusLike.NONE,
      },
      banInfo: {
        isBanned: false,
        banDate: null,
        banReason: null,
      },
    };
    const createComment = await this.commentsRepository.createComment(
      post.blogId,
      command.postId,
      newComment,
    );
    if (!createComment) throw new InternalServerErrorException();
    return {
      id: newComment.id,
      content: newComment.content,
      createdAt: newComment.createdAt,
      commentatorInfo: {
        userId: newComment.commentatorInfo.userId,
        userLogin: newComment.commentatorInfo.userLogin,
      },
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: StatusLike.NONE,
      },
    };
  }
}

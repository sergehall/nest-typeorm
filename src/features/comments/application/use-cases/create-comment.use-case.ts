import { CreateCommentDto } from '../../dto/create-comment.dto';
import { UsersEntity } from '../../../users/entities/users.entity';
import { CommentsEntity } from '../../entities/comments.entity';
import { NotFoundException } from '@nestjs/common';
import * as uuid4 from 'uuid4';
import { StatusLike } from '../../../../infrastructure/database/enums/like-status.enums';
import { PostsService } from '../../../posts/application/posts.service';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class CreateCommentCommand {
  constructor(
    public postId: string,
    public createCommentDto: CreateCommentDto,
    public user: UsersEntity,
  ) {}
}
@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase
  implements ICommandHandler<CreateCommentCommand>
{
  constructor(
    protected postsService: PostsService,
    protected commentsRepository: CommentsRepository,
  ) {}
  async execute(command: CreateCommentCommand): Promise<CommentsEntity> {
    const post = await this.postsService.checkPostInDB(command.postId);
    if (!post) throw new NotFoundException();
    const newComment: CommentsEntity = {
      id: uuid4().toString(),
      content: command.createCommentDto.content,
      userId: command.user.id,
      userLogin: command.user.login,
      createdAt: new Date().toISOString(),
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: StatusLike.NONE,
      },
    };

    return await this.commentsRepository.createComment(
      command.postId,
      newComment,
    );
  }
}

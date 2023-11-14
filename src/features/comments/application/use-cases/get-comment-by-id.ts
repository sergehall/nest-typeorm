import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../../users/dto/current-user.dto';
import { CommentViewModel } from '../../views/comment.view-model';
import { NotFoundException } from '@nestjs/common';
import { CommentsRepo } from '../../infrastructure/comments.repo';
import { CommentWithLikesInfoViewModel } from '../../views/comment-with-likes-info.view-model';

export class GetCommentByIdCommand {
  constructor(
    public commentId: string,
    public currentUserDto: CurrentUserDto | null,
  ) {}
}

@CommandHandler(GetCommentByIdCommand)
export class GetCommentByIdUseCase
  implements ICommandHandler<GetCommentByIdCommand>
{
  constructor(
    protected commandBus: CommandBus,
    protected commentsRepo: CommentsRepo,
  ) {}
  async execute(command: GetCommentByIdCommand): Promise<CommentViewModel> {
    const { commentId, currentUserDto } = command;

    const comment: CommentWithLikesInfoViewModel | null =
      await this.commentsRepo.getCommentWithLikesById(
        commentId,
        currentUserDto,
      );

    if (!comment)
      throw new NotFoundException(`Comment with id: ${commentId} not found.`);

    return comment;
  }
}

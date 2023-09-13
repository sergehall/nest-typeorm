import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { ReturnCommentsEntity } from '../../entities/return-comments.entity';
import { NotFoundException } from '@nestjs/common';
import { CommentsRepo } from '../../infrastructure/comments.repo';
import { ReturnCommentWithLikesInfoDto } from '../../dto/return-comment-with-likes-info.dto';

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
  async execute(command: GetCommentByIdCommand): Promise<ReturnCommentsEntity> {
    const { commentId, currentUserDto } = command;

    const comment: ReturnCommentWithLikesInfoDto | null =
      await this.commentsRepo.getCommentWithLikesById(
        commentId,
        currentUserDto,
      );

    if (!comment)
      throw new NotFoundException(`Comment with id: ${commentId} not found.`);

    return comment;
  }
}

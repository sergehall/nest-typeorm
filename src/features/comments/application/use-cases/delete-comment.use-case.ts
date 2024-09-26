import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../../ability/roles/action.enum';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../../users/dto/current-user.dto';
import { IdDto } from '../../../../ability/dto/id.dto';
import { CommentsRepo } from '../../infrastructure/comments.repo';

export class DeleteCommentCommand {
  constructor(
    public commentId: string,
    public currentUserDto: CurrentUserDto,
  ) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase
  implements ICommandHandler<DeleteCommentCommand>
{
  constructor(
    protected commentsRepo: CommentsRepo,
    protected caslAbilityFactory: CaslAbilityFactory,
  ) {}
  async execute(command: DeleteCommentCommand): Promise<boolean> {
    const { commentId, currentUserDto } = command;

    const commentToDelete =
      await this.commentsRepo.getCommentByIdWithoutLikes(commentId);
    if (!commentToDelete)
      throw new NotFoundException(`Comment with ID ${commentId} not found`);

    this.checkUserPermission(
      currentUserDto,
      commentToDelete.commentator.userId,
    );

    try {
      return this.commentsRepo.deleteCommentById(command.commentId);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  private checkUserPermission(
    currentUserDto: CurrentUserDto,
    commentatorInfoUserId: string,
  ) {
    const userIdDto: IdDto = { id: currentUserDto.userId };
    const ability = this.caslAbilityFactory.createForUserId(userIdDto);
    try {
      ForbiddenError.from(ability).throwUnlessCan(Action.DELETE, {
        id: commentatorInfoUserId,
      });
    } catch (error) {
      throw new ForbiddenException(
        'You are not allowed to remove this comment. ' + error.message,
      );
    }
  }
}

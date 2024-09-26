import { UpdateCommentDto } from '../../dto/update-comment.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../../ability/roles/action.enum';
import { CurrentUserDto } from '../../../users/dto/current-user.dto';
import { IdDto } from '../../../../ability/dto/id.dto';
import { CommentsRepo } from '../../infrastructure/comments.repo';

export class UpdateCommentCommand {
  constructor(
    public commentId: string,
    public updateCommentDto: UpdateCommentDto,
    public currentUserDto: CurrentUserDto,
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase
  implements ICommandHandler<UpdateCommentCommand>
{
  constructor(
    protected caslAbilityFactory: CaslAbilityFactory,
    protected commentsRepo: CommentsRepo,
  ) {}
  async execute(command: UpdateCommentCommand): Promise<boolean> {
    const { commentId, updateCommentDto, currentUserDto } = command;

    const findComment =
      await this.commentsRepo.getCommentByIdWithoutLikes(commentId);
    if (!findComment)
      throw new NotFoundException(`Comment with ID ${commentId} not found`);

    this.checkUserPermission(currentUserDto, findComment.commentator.userId);

    try {
      return await this.commentsRepo.updateComment(commentId, updateCommentDto);
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  private checkUserPermission(
    currentUserDto: CurrentUserDto,
    commentatorId: string,
  ) {
    const userIdDto: IdDto = { id: currentUserDto.userId };
    const ability = this.caslAbilityFactory.createForUserId(userIdDto);
    try {
      ForbiddenError.from(ability).throwUnlessCan(Action.UPDATE, {
        id: commentatorId,
      });
    } catch (error) {
      throw new ForbiddenException(
        'You are not allowed to update this comment. ' + error.message,
      );
    }
  }
}

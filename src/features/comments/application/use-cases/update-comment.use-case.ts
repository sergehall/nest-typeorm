import { UpdateCommentDto } from '../../dto/update-comment.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../../ability/roles/action.enum';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';

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
    protected commentsRepository: CommentsRepository,
    protected caslAbilityFactory: CaslAbilityFactory,
  ) {}
  async execute(command: UpdateCommentCommand) {
    const findComment = await this.commentsRepository.findCommentById(
      command.commentId,
    );
    if (!findComment) throw new NotFoundException();
    try {
      const ability = this.caslAbilityFactory.createForUserId({
        id: command.currentUserDto.id,
      });
      ForbiddenError.from(ability).throwUnlessCan(Action.DELETE, {
        id: findComment.commentatorInfo.userId,
      });
      return await this.commentsRepository.updateComment(
        command.commentId,
        command.updateCommentDto,
      );
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      }
    }
  }
}

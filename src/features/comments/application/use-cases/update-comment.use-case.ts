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
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { CommentsRawSqlRepository } from '../../infrastructure/comments-raw-sql.repository';
import { IdDto } from '../../../../ability/dto/id.dto';

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
    protected commentsRawSqlRepository: CommentsRawSqlRepository,
  ) {}
  async execute(command: UpdateCommentCommand): Promise<boolean> {
    const { commentId, updateCommentDto, currentUserDto } = command;

    const findComment =
      await this.commentsRawSqlRepository.findCommentByCommentId(commentId);
    if (!findComment) throw new NotFoundException('Not found comment.');

    this.checkUserPermission(currentUserDto, findComment.commentatorInfoUserId);

    try {
      return await this.commentsRawSqlRepository.updateComment(
        commentId,
        updateCommentDto,
      );
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

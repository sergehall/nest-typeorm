import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../../ability/roles/action.enum';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { CommentsRawSqlRepository } from '../../infrastructure/comments-raw-sql.repository';
import { IdDto } from '../../../../ability/dto/id.dto';

export class RemoveCommentCommand {
  constructor(
    public commentId: string,
    public currentUserDto: CurrentUserDto,
  ) {}
}

@CommandHandler(RemoveCommentCommand)
export class RemoveCommentUseCase
  implements ICommandHandler<RemoveCommentCommand>
{
  constructor(
    protected commentsRawSqlRepository: CommentsRawSqlRepository,
    protected caslAbilityFactory: CaslAbilityFactory,
  ) {}
  async execute(command: RemoveCommentCommand): Promise<boolean> {
    const { commentId, currentUserDto } = command;

    const findComment =
      await this.commentsRawSqlRepository.findCommentByCommentId(commentId);
    if (!findComment) throw new NotFoundException('Not found comment.');

    this.checkUserPermission(currentUserDto, findComment.commentatorInfoUserId);

    try {
      return this.commentsRawSqlRepository.removeCommentByCommentId(
        command.commentId,
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  private checkUserPermission(
    currentUserDto: CurrentUserDto,
    commentatorInfoUserId: string,
  ) {
    const userIdDto: IdDto = { id: currentUserDto.id };
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

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
  async execute(command: RemoveCommentCommand) {
    const findComment =
      await this.commentsRawSqlRepository.findCommentByCommentId(
        command.commentId,
      );
    if (!findComment) throw new NotFoundException();
    try {
      const ability = this.caslAbilityFactory.createForUserId({
        id: command.currentUserDto.id,
      });
      ForbiddenError.from(ability).throwUnlessCan(Action.DELETE, {
        id: findComment.commentatorInfoUserId,
      });
      return this.commentsRawSqlRepository.removeComment(command.commentId);
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      }
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException(error.message);
    }
  }
}

import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../../ability/roles/action.enum';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { PostsRawSqlRepository } from '../../infrastructure/posts-raw-sql.repository';

export class RemovePostByIdOldCommand {
  constructor(public id: string, public currentUserDto: CurrentUserDto) {}
}

@CommandHandler(RemovePostByIdOldCommand)
export class RemovePostByIdOldUseCase
  implements ICommandHandler<RemovePostByIdOldCommand>
{
  constructor(
    protected caslAbilityFactory: CaslAbilityFactory,
    protected postsRawSqlRepository: PostsRawSqlRepository,
  ) {}
  async execute(
    command: RemovePostByIdOldCommand,
  ): Promise<boolean | undefined> {
    const { id, currentUserDto } = command;
    const postToDelete = await this.postsRawSqlRepository.getPostById(id);
    if (!postToDelete) {
      throw new NotFoundException('Not found post.');
    }
    const ability = this.caslAbilityFactory.createForUserId({
      id: currentUserDto.id,
    });
    try {
      ForbiddenError.from(ability).throwUnlessCan(Action.DELETE, {
        id: postToDelete.postOwnerId,
      });
      return await this.postsRawSqlRepository.removePostByPostId(id);
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      }
    }
  }
}

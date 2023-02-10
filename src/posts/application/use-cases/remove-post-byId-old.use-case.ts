import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../ability/roles/action.enum';
import { CaslAbilityFactory } from '../../../ability/casl-ability.factory';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class RemovePostByIdOldCommand {
  constructor(public id: string) {}
}

@CommandHandler(RemovePostByIdOldCommand)
export class RemovePostByIdOldUseCase
  implements ICommandHandler<RemovePostByIdOldCommand>
{
  constructor(
    protected caslAbilityFactory: CaslAbilityFactory,
    protected postsRepository: PostsRepository,
  ) {}
  async execute(
    command: RemovePostByIdOldCommand,
  ): Promise<boolean | undefined> {
    const postToDelete = await this.postsRepository.findPostById(command.id);
    if (!postToDelete) {
      throw new NotFoundException();
    }
    const ability = this.caslAbilityFactory.createForPost({ id: command.id });
    try {
      ForbiddenError.from(ability).throwUnlessCan(Action.DELETE, {
        id: postToDelete.id,
      });
      return await this.postsRepository.removePost(command.id);
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      }
    }
  }
}

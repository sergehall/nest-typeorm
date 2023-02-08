import { User } from '../../infrastructure/schemas/user.schema';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../ability/roles/action.enum';
import { CaslAbilityFactory } from '../../../ability/casl-ability.factory';
import { UsersRepository } from '../../infrastructure/users.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class RemoveUserByIdCommand {
  constructor(public id: string, public currentUser: User) {}
}

@CommandHandler(RemoveUserByIdCommand)
export class RemoveUserByIdUseCase
  implements ICommandHandler<RemoveUserByIdCommand>
{
  constructor(
    protected caslAbilityFactory: CaslAbilityFactory,
    protected usersRepository: UsersRepository,
  ) {}
  async execute(command: RemoveUserByIdCommand) {
    const userToDelete = await this.usersRepository.findUserByUserId(
      command.id,
    );
    if (!userToDelete) throw new NotFoundException();
    try {
      const ability = this.caslAbilityFactory.createForUser(
        command.currentUser,
      );
      ForbiddenError.from(ability).throwUnlessCan(Action.DELETE, userToDelete);
      return this.usersRepository.removeUserById(command.id);
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      }
      if (error instanceof NotFoundException) {
        throw new NotFoundException();
      }
    }
  }
}

import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../../ability/roles/action.enum';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../dto/current-user.dto';
import { UsersRepo } from '../../infrastructure/users-repo';
import { UsersEntity } from '../../entities/users.entity';

export class RemoveUserByIdCommand {
  constructor(
    public id: string,
    public currentUserDto: CurrentUserDto,
  ) {}
}

@CommandHandler(RemoveUserByIdCommand)
export class RemoveUserByIdUseCase
  implements ICommandHandler<RemoveUserByIdCommand>
{
  constructor(
    protected caslAbilityFactory: CaslAbilityFactory,
    protected usersRepo: UsersRepo,
  ) {}
  async execute(command: RemoveUserByIdCommand) {
    const { id, currentUserDto } = command;

    const userToDelete: UsersEntity | null =
      await this.usersRepo.findNotBannedUserById(command.id);
    if (!userToDelete) throw new NotFoundException('Not found user.');

    try {
      const ability = this.caslAbilityFactory.createSaUser(currentUserDto);
      ForbiddenError.from(ability).throwUnlessCan(Action.DELETE, userToDelete);

      return await this.usersRepo.deleteUserDataByUserId(id);
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(
          'You are not allowed to delete this user. ' + error.message,
        );
      }
      throw new InternalServerErrorException(error.message);
    }
  }
}

import { UpdateUserDto } from '../../dto/update-user.dto';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../../ability/roles/action.enum';
import { ForbiddenException } from '@nestjs/common';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import { UsersRepository } from '../../infrastructure/users.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../dto/currentUser.dto';

export class UpdateUserCommand {
  constructor(
    public id: string,
    public updateUserDto: UpdateUserDto,
    public currentUser: CurrentUserDto,
  ) {}
}
@CommandHandler(UpdateUserCommand)
export class UpdateUserUseCase implements ICommandHandler<UpdateUserCommand> {
  constructor(
    protected caslAbilityFactory: CaslAbilityFactory,
    protected usersRepository: UsersRepository,
  ) {}
  async execute(command: UpdateUserCommand) {
    const userToUpdate = await this.usersRepository.findUserByUserId(
      command.id,
    );
    if (!userToUpdate || userToUpdate.id !== command.currentUser.id)
      throw new ForbiddenException('You are not allowed to update this user.');
    const ability = this.caslAbilityFactory.createSaUser(command.currentUser);
    try {
      ForbiddenError.from(ability).throwUnlessCan(Action.UPDATE, userToUpdate);
      // Call DB  to update user
      return `This action update a #${command.id} user`;
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      }
    }
  }
}

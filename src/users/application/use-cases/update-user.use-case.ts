import { UpdateUserDto } from '../../dto/update-user.dto';
import { UsersEntity } from '../../entities/users.entity';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../ability/roles/action.enum';
import { ForbiddenException } from '@nestjs/common';
import { CaslAbilityFactory } from '../../../ability/casl-ability.factory';
import { UsersRepository } from '../../infrastructure/users.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class UpdateUserCommand {
  constructor(
    public id: string,
    public updateUserDto: UpdateUserDto,
    public currentUser: UsersEntity,
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
      throw new ForbiddenException();
    const ability = this.caslAbilityFactory.createForUser(command.currentUser);
    try {
      ForbiddenError.from(ability).throwUnlessCan(Action.UPDATE, userToUpdate);
      //Update call DB
      return `This action update a #${command.id} user`;
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      }
    }
  }
}

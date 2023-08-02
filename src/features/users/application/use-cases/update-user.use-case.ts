import { UpdateUserDto } from '../../dto/update-user.dto';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../../ability/roles/action.enum';
import { ForbiddenException } from '@nestjs/common';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../dto/currentUser.dto';
import { UsersRawSqlRepository } from '../../infrastructure/users-raw-sql.repository';

export class UpdateUserCommand {
  constructor(
    public id: string,
    public updateUserDto: UpdateUserDto,
    public currentUserDto: CurrentUserDto,
  ) {}
}
@CommandHandler(UpdateUserCommand)
export class UpdateUserUseCase implements ICommandHandler<UpdateUserCommand> {
  constructor(
    protected caslAbilityFactory: CaslAbilityFactory,
    protected usersRawSqlRepository: UsersRawSqlRepository,
  ) {}
  async execute(command: UpdateUserCommand) {
    const { id, updateUserDto, currentUserDto } = command;

    const userToUpdate = await this.usersRawSqlRepository.findUserByUserId(id);
    if (!userToUpdate || userToUpdate.id !== currentUserDto.id)
      throw new ForbiddenException('You are not allowed to update this user.');

    const ability = this.caslAbilityFactory.createSaUser(currentUserDto);
    try {
      ForbiddenError.from(ability).throwUnlessCan(Action.UPDATE, userToUpdate);
      console.log(updateUserDto, 'updateUserDto');
      // Call DB  to update user
      return `This action update a #${id} user`;
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      }
    }
  }
}

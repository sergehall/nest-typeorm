import { UpdateUserDto } from '../../dto/update-user.dto';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../../ability/roles/action.enum';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../dto/current-user.dto';
import { UsersRepo } from '../../infrastructure/users-repo';
import { UsersEntity } from '../../entities/users.entity';

export class UpdateUserCommand {
  constructor(
    public userId: string,
    public updateUserDto: UpdateUserDto,
    public currentUserDto: CurrentUserDto,
  ) {}
}
@CommandHandler(UpdateUserCommand)
export class UpdateUserUseCase implements ICommandHandler<UpdateUserCommand> {
  constructor(
    protected caslAbilityFactory: CaslAbilityFactory,
    protected usersRepo: UsersRepo,
  ) {}
  async execute(command: UpdateUserCommand): Promise<boolean> {
    const { userId, updateUserDto, currentUserDto } = command;

    const userToUpdate: UsersEntity | null =
      await this.usersRepo.findNotBannedUserById(userId);

    if (!userToUpdate) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    await this.checkUserPermission(userToUpdate, currentUserDto);

    // Call DB  to update user
    console.log(updateUserDto, `This action update a #${userId} user`);
    return true;
  }
  private async checkUserPermission(
    userToUpdate: UsersEntity,
    currentUserDto: CurrentUserDto,
  ) {
    const ability = this.caslAbilityFactory.createSaUser(currentUserDto);
    try {
      ForbiddenError.from(ability).throwUnlessCan(Action.UPDATE, userToUpdate);
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      }
    }
  }
}

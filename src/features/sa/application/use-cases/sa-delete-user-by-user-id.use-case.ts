import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CurrentUserDto } from '../../../users/dto/current-user.dto';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../../ability/roles/action.enum';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import { UsersRepo } from '../../../users/infrastructure/users-repo';
import { UsersEntity } from '../../../users/entities/users.entity';

export class SaDeleteUserByUserIdCommand {
  constructor(
    public userId: string,
    public currentUserDto: CurrentUserDto,
  ) {}
}
@CommandHandler(SaDeleteUserByUserIdCommand)
export class SaDeleteUserByUserIdUseCase
  implements ICommandHandler<SaDeleteUserByUserIdCommand>
{
  constructor(
    private readonly caslAbilityFactory: CaslAbilityFactory,
    private readonly usersRepo: UsersRepo,
  ) {}
  async execute(command: SaDeleteUserByUserIdCommand): Promise<boolean> {
    const { userId, currentUserDto } = command;

    const userToRemove: UsersEntity | null =
      await this.usersRepo.findUserByUserId(userId);

    if (!userToRemove)
      throw new NotFoundException(`User with ID ${userId} not found`);

    await this.checkUserPermission(currentUserDto, userToRemove.userId);

    await this.usersRepo.deleteUserDataByUserId(userToRemove.userId);
    return true;
  }

  private async checkUserPermission(
    currentUserDto: CurrentUserDto,
    userId: string,
  ) {
    const ability = this.caslAbilityFactory.createSaUser(currentUserDto);
    try {
      ForbiddenError.from(ability).throwUnlessCan(Action.DELETE, {
        id: userId,
      });
    } catch (error) {
      throw new ForbiddenException(
        'You are not allowed to delete user. ' + error.message,
      );
    }
  }
}

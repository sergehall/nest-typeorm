import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../../ability/roles/action.enum';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import { UsersRepo } from '../../../users/infrastructure/users-repo';

export class SaRemoveUserByUserIdCommand {
  constructor(public userId: string, public currentUserDto: CurrentUserDto) {}
}
@CommandHandler(SaRemoveUserByUserIdCommand)
export class SaRemoveUserByUserIdUseCase
  implements ICommandHandler<SaRemoveUserByUserIdCommand>
{
  constructor(
    private readonly caslAbilityFactory: CaslAbilityFactory,
    private readonly usersRepo: UsersRepo,
  ) {}
  async execute(command: SaRemoveUserByUserIdCommand): Promise<boolean> {
    const { userId, currentUserDto } = command;

    const userToRemove = await this.usersRepo.findUserById(userId);

    if (!userToRemove)
      throw new NotFoundException(`User with ID ${userId} not found`);

    this.checkUserPermission(currentUserDto, userToRemove.userId);

    await this.usersRepo.removeUserDataByUserId(userToRemove.userId);
    return true;
  }

  private checkUserPermission(currentUserDto: CurrentUserDto, userId: string) {
    const ability = this.caslAbilityFactory.createSaUser(currentUserDto);
    try {
      ForbiddenError.from(ability).throwUnlessCan(Action.UPDATE, {
        id: userId,
      });
    } catch (error) {
      throw new ForbiddenException(
        'You are not allowed to remove user. ' + error.message,
      );
    }
  }
}

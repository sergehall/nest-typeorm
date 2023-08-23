import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRawSqlRepository } from '../../../users/infrastructure/users-raw-sql.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../../ability/roles/action.enum';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';

export class SaRemoveUserByUserIdCommand {
  constructor(public userId: string, public currentUserDto: CurrentUserDto) {}
}
@CommandHandler(SaRemoveUserByUserIdCommand)
export class SaRemoveUserByUserIdUseCase
  implements ICommandHandler<SaRemoveUserByUserIdCommand>
{
  constructor(
    private readonly caslAbilityFactory: CaslAbilityFactory,
    private readonly usersRawSqlRepository: UsersRawSqlRepository,
  ) {}
  async execute(command: SaRemoveUserByUserIdCommand): Promise<boolean> {
    const { userId, currentUserDto } = command;

    const userToRemove = await this.usersRawSqlRepository.saFindUserByUserId(
      userId,
    );
    if (!userToRemove) throw new NotFoundException('Not found user.');

    this.checkUserPermission(currentUserDto, userToRemove.userId);

    await this.usersRawSqlRepository.removeUserDataByUserId(
      userToRemove.userId,
    );
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

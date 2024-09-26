import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../../ability/roles/action.enum';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SaBanUserDto } from '../../dto/sa-ban-user..dto';
import { CurrentUserDto } from '../../../users/dto/current-user.dto';
import { BanInfoDto } from '../../../users/dto/ban-info.dto';
import { cannotBlockYourself } from '../../../../common/filters/custom-errors-messages';
import { UsersRepo } from '../../../users/infrastructure/users-repo';
import { UsersEntity } from '../../../users/entities/users.entity';

export class SaBanUnbanUserCommand {
  constructor(
    public userId: string,
    public saBanUserDto: SaBanUserDto,
    public currentUserDto: CurrentUserDto,
  ) {}
}

@CommandHandler(SaBanUnbanUserCommand)
export class SaBanUnbanUserUseCase
  implements ICommandHandler<SaBanUnbanUserCommand>
{
  constructor(
    protected caslAbilityFactory: CaslAbilityFactory,
    protected usersRepo: UsersRepo,
  ) {}

  async execute(command: SaBanUnbanUserCommand): Promise<boolean> {
    const { currentUserDto } = command;
    const { userId } = command;

    if (userId === currentUserDto.userId) {
      throw new HttpException(
        { message: cannotBlockYourself },
        HttpStatus.BAD_REQUEST,
      );
    }

    const userToBan: UsersEntity | null =
      await this.usersRepo.findUserByUserId(userId);

    if (!userToBan)
      throw new NotFoundException(`User with ID ${userId} not found`);

    await this.checkUserPermission(currentUserDto, userToBan);

    const { isBanned, banReason } = command.saBanUserDto;
    const banInfo: BanInfoDto = {
      isBanned,
      banDate: isBanned ? new Date().toISOString() : null,
      banReason: isBanned ? banReason : null,
    };

    return await this.usersRepo.saBanUnbanUser(userToBan.userId, banInfo);
  }

  private async checkUserPermission(
    currentUserDto: CurrentUserDto,
    userToBan: UsersEntity,
  ) {
    const ability = this.caslAbilityFactory.createSaUser(currentUserDto);
    try {
      ForbiddenError.from(ability).throwUnlessCan(Action.UPDATE, {
        id: userToBan.userId,
      });
    } catch (error) {
      throw new ForbiddenException(
        'You are not allowed to ban a user. ' + error.message,
      );
    }
  }
}

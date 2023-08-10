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
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { UsersRawSqlRepository } from '../../../users/infrastructure/users-raw-sql.repository';
import { BanInfoDto } from '../../../users/dto/banInfo.dto';
import { TablesUsersWithIdEntity } from '../../../users/entities/tables-user-with-id.entity';
import { cannotBlockYourself } from '../../../../exception-filter/custom-errors-messages';

export class SaBanUnbanUserCommand {
  constructor(
    public id: string,
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
    protected usersRawSqlRepository: UsersRawSqlRepository,
  ) {}

  async execute(command: SaBanUnbanUserCommand): Promise<boolean> {
    const { currentUserDto } = command;
    const { id } = command;

    if (id === currentUserDto.id) {
      throw new HttpException(
        { message: cannotBlockYourself },
        HttpStatus.BAD_REQUEST,
      );
    }

    const userToBan: TablesUsersWithIdEntity | null =
      await this.usersRawSqlRepository.saFindUserByUserId(id);
    if (!userToBan) throw new NotFoundException('Not found user.');

    await this.checkUserPermission(currentUserDto, userToBan);

    const { isBanned, banReason } = command.saBanUserDto;
    const banInfo: BanInfoDto = {
      isBanned,
      banDate: isBanned ? new Date().toISOString() : null,
      banReason: isBanned ? banReason : null,
    };

    return await this.usersRawSqlRepository.saBanUnbanUser(
      userToBan.id,
      banInfo,
    );
  }

  private async checkUserPermission(
    currentUserDto: CurrentUserDto,
    userToBan: TablesUsersWithIdEntity,
  ) {
    const ability = this.caslAbilityFactory.createSaUser(currentUserDto);
    try {
      ForbiddenError.from(ability).throwUnlessCan(Action.UPDATE, {
        id: userToBan.id,
      });
    } catch (error) {
      throw new ForbiddenException(
        'You are not allowed to ban a user. ' + error.message,
      );
    }
  }
}

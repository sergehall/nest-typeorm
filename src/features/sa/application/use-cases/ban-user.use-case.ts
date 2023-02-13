import { UpdateBanDto } from '../../dto/update-sa.dto';
import {
  BanInfo,
  User,
} from '../../../users/infrastructure/schemas/user.schema';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../../ability/roles/action.enum';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class BanUserCommand {
  constructor(
    public id: string,
    public updateBanDto: UpdateBanDto,
    public currentUser: User,
  ) {}
}

@CommandHandler(BanUserCommand)
export class BanUserUseCase implements ICommandHandler<BanUserCommand> {
  constructor(
    protected caslAbilityFactory: CaslAbilityFactory,
    protected usersRepository: UsersRepository,
  ) {}
  async execute(command: BanUserCommand): Promise<boolean | undefined> {
    const userToBan = await this.usersRepository.findUserByUserId(command.id);
    if (!userToBan) throw new NotFoundException();
    let updateBan: BanInfo = {
      isBanned: command.updateBanDto.isBanned,
      banDate: null,
      banReason: null,
    };
    if (command.updateBanDto.isBanned) {
      updateBan = {
        isBanned: command.updateBanDto.isBanned,
        banDate: new Date().toISOString(),
        banReason: command.updateBanDto.banReason,
      };
    }
    try {
      const ability = this.caslAbilityFactory.createForUser(
        command.currentUser,
      );
      ForbiddenError.from(ability).throwUnlessCan(Action.UPDATE, userToBan);
      return this.usersRepository.banUser(userToBan, updateBan);
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      }
      if (error instanceof NotFoundException) {
        throw new NotFoundException();
      }
    }
  }
}

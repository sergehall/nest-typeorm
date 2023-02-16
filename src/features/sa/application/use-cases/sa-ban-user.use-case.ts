import { BanInfo } from '../../../users/infrastructure/schemas/user.schema';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../../ability/roles/action.enum';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SaBanUserDto } from '../../dto/sa-ban-user..dto';
import { RemoveDevicesBannedUserCommand } from '../../../security-devices/application/use-cases/remove-devices-bannedUser.use-case';
import { ChangeBanStatusUserCommentsCommand } from '../../../comments/application/use-cases/change-banStatus-comments.use-case';
import { ChangeBanStatusUserPostsCommand } from '../../../posts/application/use-cases/change-banStatus-posts.use-case';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { ChangeBanStatusUserBlogsCommand } from '../../../blogger-blogs/application/use-cases/change-ban-status-owner-blog.use-case';

export class SaBanUserCommand {
  constructor(
    public id: string,
    public saBanUserDto: SaBanUserDto,
    public currentUser: CurrentUserDto,
  ) {}
}

@CommandHandler(SaBanUserCommand)
export class SaBanUserUseCase implements ICommandHandler<SaBanUserCommand> {
  constructor(
    protected caslAbilityFactory: CaslAbilityFactory,
    protected usersRepository: UsersRepository,
    protected commandBus: CommandBus,
  ) {}
  async execute(command: SaBanUserCommand): Promise<boolean | undefined> {
    const userToBan = await this.usersRepository.findUserByUserId(command.id);
    if (!userToBan) throw new NotFoundException();
    let updateBan: BanInfo = {
      isBanned: command.saBanUserDto.isBanned,
      banDate: null,
      banReason: null,
    };
    if (command.saBanUserDto.isBanned) {
      updateBan = {
        isBanned: command.saBanUserDto.isBanned,
        banDate: new Date().toISOString(),
        banReason: command.saBanUserDto.banReason,
      };
    }
    const ability = this.caslAbilityFactory.createForUser(command.currentUser);
    try {
      ForbiddenError.from(ability).throwUnlessCan(Action.UPDATE, userToBan);
      await this.commandBus.execute(
        new RemoveDevicesBannedUserCommand(userToBan.id),
      );
      await this.commandBus.execute(
        new ChangeBanStatusUserCommentsCommand(
          userToBan.id,
          command.saBanUserDto.isBanned,
        ),
      );
      await this.commandBus.execute(
        new ChangeBanStatusUserPostsCommand(
          userToBan.id,
          command.saBanUserDto.isBanned,
        ),
      );
      await this.commandBus.execute(
        new ChangeBanStatusUserBlogsCommand(
          userToBan.id,
          command.saBanUserDto.isBanned,
        ),
      );
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

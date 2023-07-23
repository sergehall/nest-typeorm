import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../../ability/roles/action.enum';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SaBanUserDto } from '../../dto/sa-ban-user..dto';
import { RemoveDevicesBannedUserCommand } from '../../../security-devices/application/use-cases/remove-devices-bannedUser.use-case';
import { ChangeBanStatusUserCommentsCommand } from '../../../comments/application/use-cases/change-banStatus-comments.use-case';
import { ChangeBanStatusUserPostsCommand } from '../../../posts/application/use-cases/change-banStatus-posts.use-case';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { ChangeBanStatusUserBlogsCommand } from '../../../blogger-blogs/application/use-cases/change-ban-status-owner-blog.use-case';
import { UsersRawSqlRepository } from '../../../users/infrastructure/users-raw-sql.repository';
import { BanInfoDto } from '../../../users/dto/banInfo.dto';

export class SaBanUserCommand {
  constructor(
    public id: string,
    public saBanUserDto: SaBanUserDto,
    public currentUserDto: CurrentUserDto,
  ) {}
}

@CommandHandler(SaBanUserCommand)
export class SaBanUserUseCase implements ICommandHandler<SaBanUserCommand> {
  constructor(
    protected caslAbilityFactory: CaslAbilityFactory,
    protected usersRawSqlRepository: UsersRawSqlRepository,
    protected commandBus: CommandBus,
  ) {}

  async execute(command: SaBanUserCommand): Promise<boolean> {
    const userToBan = await this.usersRawSqlRepository.findUserByUserId(
      command.id,
    );

    if (!userToBan) {
      throw new NotFoundException('Not found user.');
    }

    const banInfo: BanInfoDto = {
      isBanned: command.saBanUserDto.isBanned,
      banDate: command.saBanUserDto.isBanned ? new Date().toISOString() : null,
      banReason: command.saBanUserDto.banReason || null,
    };

    const ability = this.caslAbilityFactory.createForUser(
      command.currentUserDto,
    );

    try {
      ForbiddenError.from(ability).throwUnlessCan(Action.UPDATE, userToBan);

      // Use Promise.all to execute the commands concurrently
      await Promise.all([
        this.commandBus.execute(
          new RemoveDevicesBannedUserCommand(userToBan.id),
        ),
        this.commandBus.execute(
          new ChangeBanStatusUserCommentsCommand(
            userToBan.id,
            command.saBanUserDto.isBanned,
          ),
        ),
        this.commandBus.execute(
          new ChangeBanStatusUserPostsCommand(
            userToBan.id,
            command.saBanUserDto.isBanned,
          ),
        ),
        this.commandBus.execute(
          new ChangeBanStatusUserBlogsCommand(
            userToBan.id,
            command.saBanUserDto.isBanned,
          ),
        ),
        this.usersRawSqlRepository.banUser(userToBan.id, banInfo),
      ]);
      return true;
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      }
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }
}

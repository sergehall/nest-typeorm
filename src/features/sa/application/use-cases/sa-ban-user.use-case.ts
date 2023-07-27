import {
  ForbiddenException,
  HttpException,
  HttpStatus,
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
import { TablesUsersEntityWithId } from '../../../users/entities/userRawSqlWithId.entity';
import { cannotBlockYourself } from '../../../../exception-filter/errors-messages';

export class SaBanUserByUserIdCommand {
  constructor(
    public id: string,
    public saBanUserDto: SaBanUserDto,
    public currentUserDto: CurrentUserDto,
  ) {}
}

@CommandHandler(SaBanUserByUserIdCommand)
export class SaBanUserByUserIdUseCase
  implements ICommandHandler<SaBanUserByUserIdCommand>
{
  constructor(
    protected caslAbilityFactory: CaslAbilityFactory,
    protected usersRawSqlRepository: UsersRawSqlRepository,
    protected commandBus: CommandBus,
  ) {}

  async execute(command: SaBanUserByUserIdCommand): Promise<boolean> {
    const { isBanned, banReason } = command.saBanUserDto;
    const { currentUserDto } = command;
    const { id } = command;

    if (id === currentUserDto.id) {
      throw new HttpException(
        { message: cannotBlockYourself },
        HttpStatus.BAD_REQUEST,
      );
    }

    const userToBan = await this.usersRawSqlRepository.saFindUserByUserId(id);
    if (!userToBan) {
      throw new NotFoundException('Not found user.');
    }

    await this.checkUserPermission(currentUserDto, userToBan);

    const banInfo: BanInfoDto = {
      isBanned: isBanned,
      banDate: new Date().toISOString(),
      banReason: banReason,
    };

    await this.executeChangeBanStatusCommands(userToBan.id, banInfo);

    return true;
  }

  private async executeChangeBanStatusCommands(
    userId: string,
    banInfo: BanInfoDto,
  ): Promise<boolean> {
    try {
      // Use Promise.all to execute the commands concurrently
      await Promise.all([
        this.commandBus.execute(
          new ChangeBanStatusUserBlogsCommand(userId, banInfo.isBanned),
        ),
        this.commandBus.execute(
          new ChangeBanStatusUserPostsCommand(userId, banInfo.isBanned),
        ),
        this.commandBus.execute(
          new ChangeBanStatusUserCommentsCommand(userId, banInfo.isBanned),
        ),
        this.commandBus.execute(new RemoveDevicesBannedUserCommand(userId)),
        this.usersRawSqlRepository.banUser(userId, banInfo),
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

  private async checkUserPermission(
    currentUserDto: CurrentUserDto,
    userToBan: TablesUsersEntityWithId,
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

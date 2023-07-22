import { UpdateBanUserDto } from '../../dto/update-ban-user.dto';
import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../../ability/roles/action.enum';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { ChangeBanStatusCommentsByUserIdBlogIdCommand } from '../../../comments/application/use-cases/change-banStatus-comments-by-userId-blogId.use-case';
import { AddBannedUserToBanListCommand } from './add-banned-user-to-ban-list.use-case';
import { ChangeBanStatusPostsByUserIdBlogIdCommand } from '../../../posts/application/use-cases/change-banStatus-posts -by-userId-blogId.use-case';
import { UsersRawSqlRepository } from '../../../users/infrastructure/users-raw-sql.repository';
import { BloggerBlogsRawSqlRepository } from '../../infrastructure/blogger-blogs-raw-sql.repository';
import { BannedUsersForBlogsEntity } from '../../entities/banned-users-for-blogs.entity';
import * as uuid4 from 'uuid4';

export class BanUserForBlogCommand {
  constructor(
    public userId: string,
    public updateBanUserDto: UpdateBanUserDto,
    public currentUser: CurrentUserDto,
  ) {}
}
@CommandHandler(BanUserForBlogCommand)
export class BanUserForBlogUseCase
  implements ICommandHandler<BanUserForBlogCommand>
{
  constructor(
    protected caslAbilityFactory: CaslAbilityFactory,
    protected usersRawSqlRepository: UsersRawSqlRepository,
    protected bloggerBlogsRawSqlRepository: BloggerBlogsRawSqlRepository,
    protected commandBus: CommandBus,
  ) {}
  async execute(command: BanUserForBlogCommand) {
    const userToBan = await this.usersRawSqlRepository.findUserByUserId(
      command.userId,
    );
    if (!userToBan) throw new NotFoundException('Not found user.');
    const blogForBan = await this.bloggerBlogsRawSqlRepository.findBlogById(
      command.updateBanUserDto.blogId,
    );
    if (!blogForBan) throw new NotFoundException('Not found blog.');
    const bannedUserForBlogEntity: BannedUsersForBlogsEntity = {
      id: uuid4(),
      userId: userToBan.id,
      blogId: blogForBan.id,
      login: userToBan.login,
      isBanned: command.updateBanUserDto.isBanned,
      banDate: new Date().toISOString(),
      banReason: command.updateBanUserDto.banReason,
    };

    const ability = this.caslAbilityFactory.createForUserId({
      id: command.currentUser.id,
    });
    try {
      ForbiddenError.from(ability).throwUnlessCan(Action.UPDATE, {
        id: blogForBan.blogOwnerId,
      });
      await this.commandBus.execute(
        new ChangeBanStatusPostsByUserIdBlogIdCommand(bannedUserForBlogEntity),
      );
      await this.commandBus.execute(
        new ChangeBanStatusCommentsByUserIdBlogIdCommand(
          bannedUserForBlogEntity,
        ),
      );
      return await this.commandBus.execute(
        new AddBannedUserToBanListCommand(bannedUserForBlogEntity),
      );
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(
          'You are not allowed to banned user for this blog. ' + error.message,
        );
      }
      throw new InternalServerErrorException(error.message);
    }
  }
}

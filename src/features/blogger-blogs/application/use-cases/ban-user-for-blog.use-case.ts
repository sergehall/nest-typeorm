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
import { TablesUsersEntityWithId } from '../../../users/entities/userRawSqlWithId.entity';

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
    private readonly caslAbilityFactory: CaslAbilityFactory,
    private readonly usersRawSqlRepository: UsersRawSqlRepository,
    private readonly bloggerBlogsRawSqlRepository: BloggerBlogsRawSqlRepository,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: BanUserForBlogCommand) {
    const userToBan = await this.getUserToBan(command.userId);
    const blogForBan = await this.getBlogForBan(
      command.updateBanUserDto.blogId,
    );

    await this.checkUserPermission(
      command.currentUser.id,
      blogForBan.blogOwnerId,
    );

    const bannedUserForBlogEntity: BannedUsersForBlogsEntity =
      this.createBannedUserEntity(userToBan, command.updateBanUserDto);

    return await this.executeChangeBanStatusCommands(bannedUserForBlogEntity);
  }

  private async getUserToBan(userId: string): Promise<TablesUsersEntityWithId> {
    const userToBan: TablesUsersEntityWithId | null =
      await this.usersRawSqlRepository.findUserByUserId(userId);
    if (!userToBan) {
      throw new NotFoundException('Not found user.');
    }
    return userToBan;
  }

  private async getBlogForBan(blogId: string) {
    const blogForBan = await this.bloggerBlogsRawSqlRepository.findBlogById(
      blogId,
    );
    if (!blogForBan) {
      throw new NotFoundException('Not found blog.');
    }
    return blogForBan;
  }

  private createBannedUserEntity(
    userToBan: TablesUsersEntityWithId,
    updateBanUserDto: UpdateBanUserDto,
  ): BannedUsersForBlogsEntity {
    return {
      id: uuid4().toString(),
      userId: userToBan.id,
      blogId: updateBanUserDto.blogId,
      login: userToBan.login,
      isBanned: updateBanUserDto.isBanned,
      banDate: new Date().toISOString(),
      banReason: updateBanUserDto.banReason,
    };
  }

  private async checkUserPermission(userId: string, blogOwnerId: string) {
    const ability = this.caslAbilityFactory.createForUserId({ id: userId });
    try {
      ForbiddenError.from(ability).throwUnlessCan(Action.UPDATE, {
        id: blogOwnerId,
      });
    } catch (error) {
      throw new ForbiddenException(
        'You are not allowed to ban a user for this blog. ' + error.message,
      );
    }
  }

  private async executeChangeBanStatusCommands(
    bannedUserForBlogEntity: BannedUsersForBlogsEntity,
  ) {
    try {
      await Promise.all([
        this.commandBus.execute(
          new ChangeBanStatusPostsByUserIdBlogIdCommand(
            bannedUserForBlogEntity,
          ),
        ),
        this.commandBus.execute(
          new ChangeBanStatusCommentsByUserIdBlogIdCommand(
            bannedUserForBlogEntity,
          ),
        ),
        this.commandBus.execute(
          new AddBannedUserToBanListCommand(bannedUserForBlogEntity),
        ),
      ]);
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }
}

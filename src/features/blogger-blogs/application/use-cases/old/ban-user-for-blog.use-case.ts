import { UpdateBanUserDto } from '../../../dto/update-ban-user.dto';
import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../../../ability/roles/action.enum';
import { CaslAbilityFactory } from '../../../../../ability/casl-ability.factory';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../../../users/dto/currentUser.dto';
import { ChangeBanStatusCommentsByUserIdBlogIdCommand } from '../../../../comments/application/use-cases/change-banStatus-comments-by-userId-blogId.use-case';
import { AddBannedUserToBanListCommand } from '../../../../sa/application/use-cases/old/add-banned-user-to-ban-list.use-case';
import { UsersRawSqlRepository } from '../../../../users/infrastructure/users-raw-sql.repository';
import { BloggerBlogsRawSqlRepository } from '../../../infrastructure/blogger-blogs-raw-sql.repository';
import { BannedUsersForBlogsEntity } from '../../../entities/banned-users-for-blogs.entity';
import { ChangeBanStatusLikesPostsForBannedUserCommand } from '../../../../posts/application/use-cases/change-banstatus-posts-by-userid-blogid.use-case';
import * as uuid4 from 'uuid4';
import { TablesUsersWithIdEntity } from '../../../../users/entities/tables-user-with-id.entity';
import { cannotBlockYourself } from '../../../../../exception-filter/custom-errors-messages';
import { TableBloggerBlogsRawSqlEntity } from '../../../entities/table-blogger-blogs-raw-sql.entity';

export class BanUserForBlogCommand {
  constructor(
    public userToBanId: string,
    public updateBanUserDto: UpdateBanUserDto,
    public currentUserDto: CurrentUserDto,
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

  // This method is executed when the BanUserForBlogCommand is dispatched to this handler.
  async execute(command: BanUserForBlogCommand): Promise<boolean> {
    const { userToBanId, updateBanUserDto, currentUserDto } = command;

    if (userToBanId === currentUserDto.id) {
      throw new HttpException(
        { message: cannotBlockYourself },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Fetch the user to be banned from the repository.
    const userForBan = await this.getUserToBan(userToBanId);

    // Fetch the blog associated with the ban from the repository.
    const blogForBan = await this.getBlogForBan(updateBanUserDto.blogId);

    // Check if the current user has permission to perform the ban action.
    await this.checkUserPermission(blogForBan.blogOwnerId, currentUserDto);

    // Create a BannedUsersForBlogsEntity object that represents the ban entity.
    const bannedUserForBlogEntity: BannedUsersForBlogsEntity =
      this.createBannedUserEntity(userForBan, updateBanUserDto);

    // // Execute several commands asynchronously to change the ban status for the user in different scenarios.
    // return await this.executeChangeBanStatusCommands(bannedUserForBlogEntity);
    return await this.executeChangeBanStatusCommands(bannedUserForBlogEntity);
  }

  // Fetches the user to be banned from the repository based on the provided user ID.
  private async getUserToBan(userId: string): Promise<TablesUsersWithIdEntity> {
    const userToBan: TablesUsersWithIdEntity | null =
      await this.usersRawSqlRepository.findUserByUserId(userId);
    if (!userToBan) throw new NotFoundException('Not found user.');
    return userToBan;
  }

  // Fetches the blog associated with the ban from the repository based on the provided blog ID.
  private async getBlogForBan(
    blogId: string,
  ): Promise<TableBloggerBlogsRawSqlEntity> {
    const blogForBan = await this.bloggerBlogsRawSqlRepository.findBlogByBlogId(
      blogId,
    );
    if (!blogForBan) throw new NotFoundException('Not found blog.');
    return blogForBan;
  }

  // Creates a new instance of BannedUsersForBlogsEntity using the user and DTO information.
  private createBannedUserEntity(
    userToBan: TablesUsersWithIdEntity,
    updateBanUserDto: UpdateBanUserDto,
  ): BannedUsersForBlogsEntity {
    return {
      id: uuid4().toString(),
      userId: userToBan.id,
      blogId: updateBanUserDto.blogId,
      login: userToBan.login,
      isBanned: updateBanUserDto.isBanned,
      banReason: updateBanUserDto.banReason,
      banDate: new Date().toISOString(),
    };
  }

  // Checks if the current user has permission to ban the user associated with the provided user ID.
  private async checkUserPermission(
    userId: string,
    currentUserDto: CurrentUserDto,
  ) {
    const ability = this.caslAbilityFactory.createForUserId({ id: userId });
    try {
      // Throws a ForbiddenError if the current user doesn't have the permission to perform the action.
      ForbiddenError.from(ability).throwUnlessCan(Action.UPDATE, {
        id: currentUserDto.id,
      });
    } catch (error) {
      throw new ForbiddenException(
        'You are not allowed to ban a user for this blog. ' + error.message,
      );
    }
  }

  // Executes a series of commands asynchronously to change the ban status for the user in different contexts (likes, comments, ban list).
  private async executeChangeBanStatusCommands(
    bannedUserForBlogEntity: BannedUsersForBlogsEntity,
  ): Promise<boolean> {
    try {
      await Promise.all([
        this.commandBus.execute(
          new ChangeBanStatusLikesPostsForBannedUserCommand(
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
      return true;
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }
}

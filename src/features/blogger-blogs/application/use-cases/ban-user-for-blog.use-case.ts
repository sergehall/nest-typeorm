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
import { UsersRawSqlRepository } from '../../../users/infrastructure/users-raw-sql.repository';
import { BloggerBlogsRawSqlRepository } from '../../infrastructure/blogger-blogs-raw-sql.repository';
import { BannedUsersForBlogsEntity } from '../../entities/banned-users-for-blogs.entity';
import * as uuid4 from 'uuid4';
import { TablesUsersEntityWithId } from '../../../users/entities/userRawSqlWithId.entity';
import { ChangeBanStatusLikesPostsForBannedUserCommand } from '../../../posts/application/use-cases/change-banStatus-posts -by-userId-blogId.use-case';

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

    // Step 1: Fetch the user to be banned from the repository.
    const userForBan = await this.getUserToBan(userToBanId);

    // Step 2: Fetch the blog associated with the ban from the repository.
    const blogForBan = await this.getBlogForBan(updateBanUserDto.blogId);

    // Step 3: Check if the current user has permission to perform the ban action.
    await this.checkUserPermission(blogForBan.blogOwnerId, currentUserDto);

    // Step 4: Create a BannedUsersForBlogsEntity object that represents the ban entity.
    const bannedUserForBlogEntity: BannedUsersForBlogsEntity =
      this.createBannedUserEntity(userForBan, updateBanUserDto);

    // Step 5: Execute several commands asynchronously to change the ban status for the user in different scenarios.
    return await this.executeChangeBanStatusCommands(bannedUserForBlogEntity);
  }

  // Fetches the user to be banned from the repository based on the provided user ID.
  private async getUserToBan(userId: string): Promise<TablesUsersEntityWithId> {
    const userToBan: TablesUsersEntityWithId | null =
      await this.usersRawSqlRepository.findUserByUserId(userId);
    if (!userToBan) throw new NotFoundException('Not found user.');
    return userToBan;
  }

  // Fetches the blog associated with the ban from the repository based on the provided blog ID.
  private async getBlogForBan(blogId: string) {
    const blogForBan = await this.bloggerBlogsRawSqlRepository.findBlogByBlogId(
      blogId,
    );
    if (!blogForBan) throw new NotFoundException('Not found blog.');
    return blogForBan;
  }

  // Creates a new instance of BannedUsersForBlogsEntity using the user and DTO information.
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

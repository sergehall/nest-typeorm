import { UpdateBanUserDto } from '../../dto/update-ban-user.dto';
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
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { UsersRawSqlRepository } from '../../../users/infrastructure/users-raw-sql.repository';
import { BloggerBlogsRawSqlRepository } from '../../infrastructure/blogger-blogs-raw-sql.repository';
import { TableBannedUsersForBlogsEntity } from '../../entities/table-banned-users-for-blogs.entity';
import * as uuid4 from 'uuid4';
import { TablesUsersWithIdEntity } from '../../../users/entities/tables-user-with-id.entity';
import { cannotBlockYourself } from '../../../../common/filters/custom-errors-messages';
import { TableBloggerBlogsRawSqlEntity } from '../../entities/table-blogger-blogs-raw-sql.entity';

export class ManageBlogAccessCommand {
  constructor(
    public userId: string,
    public updateBanUserDto: UpdateBanUserDto,
    public currentUserDto: CurrentUserDto,
  ) {}
}

@CommandHandler(ManageBlogAccessCommand)
export class ManageBlogAccessUseCase
  implements ICommandHandler<ManageBlogAccessCommand>
{
  constructor(
    private readonly caslAbilityFactory: CaslAbilityFactory,
    private readonly usersRawSqlRepository: UsersRawSqlRepository,
    private readonly bloggerBlogsRawSqlRepository: BloggerBlogsRawSqlRepository,
  ) {}

  // This method is executed when the BanUserForBlogCommand is dispatched to this handler.
  async execute(command: ManageBlogAccessCommand): Promise<boolean> {
    const { userId, updateBanUserDto, currentUserDto } = command;

    if (userId === currentUserDto.userId) {
      throw new HttpException(
        { message: cannotBlockYourself },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Fetch the user to be banned from the repository.
    const userForBan = await this.getUserToBan(userId);

    // Fetch the blog associated with the ban from the repository.
    const blogForBan = await this.getBlogForBan(updateBanUserDto.blogId);

    // Check if the current user has permission to perform the ban action.
    await this.checkUserPermission(blogForBan.blogOwnerId, currentUserDto);

    // Create a TableBannedUsersForBlogsEntity object that represents the ban entity.
    const bannedUserForBlogEntity: TableBannedUsersForBlogsEntity =
      this.createBannedUserEntity(userForBan, updateBanUserDto);

    return await this.bloggerBlogsRawSqlRepository.manageBlogAccess(
      bannedUserForBlogEntity,
    );
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

  // Creates a new instance of TableBannedUsersForBlogsEntity using the user and DTO information.
  private createBannedUserEntity(
    userToBan: TablesUsersWithIdEntity,
    updateBanUserDto: UpdateBanUserDto,
  ): TableBannedUsersForBlogsEntity {
    return {
      id: uuid4().toString(),
      userId: userToBan.userId,
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
        id: currentUserDto.userId,
      });
    } catch (error) {
      throw new ForbiddenException(
        'You are not allowed to ban a user for this blog. ' + error.message,
      );
    }
  }
}

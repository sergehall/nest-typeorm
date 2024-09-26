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
import { CurrentUserDto } from '../../../users/dto/current-user.dto';
import { cannotBlockYourself } from '../../../../common/filters/custom-errors-messages';
import { BloggerBlogsRepo } from '../../infrastructure/blogger-blogs.repo';
import { BloggerBlogsEntity } from '../../entities/blogger-blogs.entity';
import { BannedUsersForBlogsRepo } from '../../../users/infrastructure/banned-users-for-blogs.repo';
import { UsersRepo } from '../../../users/infrastructure/users-repo';
import { UsersEntity } from '../../../users/entities/users.entity';

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
    private readonly bloggerBlogsRepo: BloggerBlogsRepo,
    private readonly usersRepo: UsersRepo,
    private readonly bannedUsersForBlogsRepo: BannedUsersForBlogsRepo,
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
    const userForBan: UsersEntity = await this.getUserToBan(userId);

    // Fetch the blog associated with the ban from the repository.
    const blogForBan: BloggerBlogsEntity = await this.getBlogForBan(
      updateBanUserDto.blogId,
    );

    // Check if the current user has permission to perform the ban action.
    await this.checkUserPermission(blogForBan.blogOwner.userId, currentUserDto);

    return await this.bannedUsersForBlogsRepo.manageBlogAccess(
      userForBan,
      blogForBan,
      updateBanUserDto,
    );
  }

  // Fetches the user to be banned from the repository based on the provided user ID.
  private async getUserToBan(userId: string): Promise<UsersEntity> {
    const userToBan: UsersEntity | null =
      await this.usersRepo.findUserByUserId(userId);
    if (!userToBan)
      throw new NotFoundException(`User with id: ${userId} not found`);
    return userToBan;
  }

  // Fetches the blog associated with the ban from the repository based on the provided blog ID.
  private async getBlogForBan(blogId: string): Promise<BloggerBlogsEntity> {
    const blogForBan = await this.bloggerBlogsRepo.findBlogById(blogId);
    if (!blogForBan)
      throw new NotFoundException(`Blog with id: ${blogId} not found`);
    return blogForBan;
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

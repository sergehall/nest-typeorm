import { CurrentUserDto } from '../../../users/dto/current-user.dto';
import { BlogIdParams } from '../../../../common/query/params/blogId.params';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BloggerBlogsEntity } from '../../entities/blogger-blogs.entity';
import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { BloggerBlogsRepo } from '../../infrastructure/blogger-blogs.repo';
import { BlogsSubscribersRepo } from '../../infrastructure/blogs-subscribers.repo';
import { BlogsSubscribersEntity } from '../../entities/blogs-subscribers.entity';
import { userNotHavePermissionSubscribeForBlog } from '../../../../common/filters/custom-errors-messages';
import { ForbiddenError } from '@casl/ability';
import { BannedUsersForBlogsRepo } from '../../../users/infrastructure/banned-users-for-blogs.repo';
import { SubscriptionStatus } from '../../enums/subscription-status.enums';

export class ManageBlogsSubscribeCommand {
  constructor(
    public params: BlogIdParams,
    public subscriptionStatus: SubscriptionStatus,
    public currentUserDto: CurrentUserDto,
  ) {}
}

@CommandHandler(ManageBlogsSubscribeCommand)
export class ManageBlogsSubscribeUseCase
  implements ICommandHandler<ManageBlogsSubscribeCommand>
{
  constructor(
    private readonly bloggerBlogsRepo: BloggerBlogsRepo,
    private readonly blogsSubscribersRepo: BlogsSubscribersRepo,
    private readonly bannedUsersForBlogsRepo: BannedUsersForBlogsRepo,
  ) {}
  async execute(
    command: ManageBlogsSubscribeCommand,
  ): Promise<BlogsSubscribersEntity> {
    const { params, subscriptionStatus, currentUserDto } = command;
    const blogId = params.blogId;

    const blog: BloggerBlogsEntity | null =
      await this.bloggerBlogsRepo.findBlogById(blogId);
    if (!blog) {
      throw new NotFoundException(`Blog with ID ${blogId} not found`);
    }

    await this.checkUserPermission(blog, currentUserDto);

    return await this.blogsSubscribersRepo.manageBlogsSubscribe(
      subscriptionStatus,
      blog,
      currentUserDto,
    );
  }

  private async checkUserPermission(
    blog: BloggerBlogsEntity,
    currentUserDto: CurrentUserDto,
  ): Promise<void> {
    try {
      // Check if the user is banned from posting in this blog
      await this.bannedUsersForBlogsRepo.userIsBanned(
        currentUserDto.userId,
        blog.id,
      );
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(userNotHavePermissionSubscribeForBlog);
      }
      throw new InternalServerErrorException(error.message);
    }
  }
}

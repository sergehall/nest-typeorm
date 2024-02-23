import { CurrentUserDto } from '../../../users/dto/current-user.dto';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../../ability/roles/action.enum';
import { ParseQueriesDto } from '../../../../common/query/dto/parse-queries.dto';
import { PaginatorDto } from '../../../../common/helpers/paginator.dto';
import { BloggerBlogsRepo } from '../../infrastructure/blogger-blogs.repo';
import { BannedUsersForBlogsRepo } from '../../../users/infrastructure/banned-users-for-blogs.repo';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import { BannedUsersEntityAndCountDto } from '../../dto/banned-users-entity-and-count.dto';
import { BannedUserForBlogViewModel } from '../../../users/views/banned-user-for-blog.view-model';
import { BannedUsersForBlogsEntity } from '../../../users/entities/banned-users-for-blogs.entity';

export class SearchBannedUsersInBlogCommand {
  constructor(
    public blogId: string,
    public queryData: ParseQueriesDto,
    public currentUser: CurrentUserDto,
  ) {}
}

@CommandHandler(SearchBannedUsersInBlogCommand)
export class SearchBannedUsersInBlogUseCase
  implements ICommandHandler<SearchBannedUsersInBlogCommand>
{
  constructor(
    protected caslAbilityFactory: CaslAbilityFactory,
    protected bloggerBlogsRepo: BloggerBlogsRepo,
    protected bannedUsersForBlogsRepo: BannedUsersForBlogsRepo,
    protected commandBus: CommandBus,
  ) {}
  async execute(
    command: SearchBannedUsersInBlogCommand,
  ): Promise<PaginatorDto> {
    const { blogId, queryData, currentUser } = command;
    const { pageNumber, pageSize } = queryData.queryPagination;

    // Check if the blog exists
    const blog = await this.bloggerBlogsRepo.findBlogById(blogId);
    if (!blog) throw new NotFoundException(`Blog with id: ${blogId} not found`);

    // Check user's permission to ban the user
    await this.checkUserPermission(currentUser.userId, blog.blogOwner.userId);

    // Find all banned users for the blog
    const bannedUsersAndCount: BannedUsersEntityAndCountDto =
      await this.bannedUsersForBlogsRepo.findBannedUsers(blogId, queryData);

    // Get the total count of banned users for pagination purposes
    const totalCount = bannedUsersAndCount.countBannedUsers;

    if (totalCount === 0) {
      return {
        pagesCount: 0,
        page: pageNumber,
        pageSize: pageSize,
        totalCount: 0,
        items: [],
      };
    }

    // Calculate the number of pages for pagination
    const pagesCount = Math.ceil(
      totalCount / queryData.queryPagination.pageSize,
    );

    const transformedBannedUsers: BannedUserForBlogViewModel[] =
      await this.transformedBannedUsers(bannedUsersAndCount.bannedUsers);

    // Return the paginated and transformed banned users data
    return {
      pagesCount: pagesCount,
      page: queryData.queryPagination.pageNumber,
      pageSize: queryData.queryPagination.pageSize,
      totalCount: totalCount,
      items: transformedBannedUsers,
    };
  }

  private async checkUserPermission(userId: string, blogOwnerId: string) {
    // Check if the user has permission to ban user for blog
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

  private async transformedBannedUsers(
    bannedUsers: BannedUsersForBlogsEntity[],
  ): Promise<BannedUserForBlogViewModel[]> {
    return bannedUsers.reduce<BannedUserForBlogViewModel[]>((acc, user) => {
      acc.push({
        id: user.bannedUserForBlogs.userId,
        login: user.bannedUserForBlogs.login,
        banInfo: {
          isBanned: user.isBanned,
          banDate: user.banDate,
          banReason: user.banReason,
        },
      });
      return acc;
    }, []);
  }
}

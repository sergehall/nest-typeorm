import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import { UsersRawSqlRepository } from '../../../users/infrastructure/users-raw-sql.repository';
import { BloggerBlogsRawSqlRepository } from '../../infrastructure/blogger-blogs-raw-sql.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../../ability/roles/action.enum';
import { BannedUsersForBlogsRawSqlRepository } from '../../../users/infrastructure/banned-users-for-blogs-raw-sql.repository';
import { ParseQueriesDto } from '../../../../common/query/dto/parse-queries.dto';
import { PaginatedResultDto } from '../../../../common/pagination/dto/paginated-result.dto';
import { BannedUsersCountBannedUsersDto } from '../../dto/banned-users-count-banned-users.dto';

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
    protected usersRawSqlRepository: UsersRawSqlRepository,
    protected bloggerBlogsRawSqlRepository: BloggerBlogsRawSqlRepository,
    protected bannedUsersForBlogsRawSqlRepository: BannedUsersForBlogsRawSqlRepository,
    protected commandBus: CommandBus,
  ) {}
  async execute(
    command: SearchBannedUsersInBlogCommand,
  ): Promise<PaginatedResultDto> {
    const { blogId, queryData, currentUser } = command;
    const { pageNumber, pageSize } = queryData.queryPagination;

    // Check if the blog exists
    const blog = await this.bloggerBlogsRawSqlRepository.findBlogById(blogId);
    if (!blog) throw new NotFoundException('Not found blog.');

    // Check user's permission to ban the user
    await this.checkUserPermission(currentUser.userId, blog.blogOwnerId);

    // Find all banned users for the blog
    const bannedUsersAndCount: BannedUsersCountBannedUsersDto =
      await this.bannedUsersForBlogsRawSqlRepository.findBannedUsers(
        blogId,
        queryData,
      );

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

    // Return the paginated and transformed banned users data
    return {
      pagesCount: pagesCount,
      page: queryData.queryPagination.pageNumber,
      pageSize: queryData.queryPagination.pageSize,
      totalCount: totalCount,
      items: bannedUsersAndCount.bannedUsers,
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
}

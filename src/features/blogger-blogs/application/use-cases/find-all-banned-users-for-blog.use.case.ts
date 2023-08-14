import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import { UsersRawSqlRepository } from '../../../users/infrastructure/users-raw-sql.repository';
import { BloggerBlogsRawSqlRepository } from '../../infrastructure/blogger-blogs-raw-sql.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../../ability/roles/action.enum';
import { BannedUsersForBlogsRawSqlRepository } from '../../../users/infrastructure/banned-users-for-blogs-raw-sql.repository';
import { ReturnBannedUsersForBlogEntity } from '../../entities/return-banned-users-for-blog.entity';
import { BannedUsersForBlogsEntity } from '../../entities/banned-users-for-blogs.entity';
import { ParseQueriesDto } from '../../../../common/query/dto/parse-queries.dto';
import { PaginatedResultDto } from '../../../../common/pagination/dto/paginated-result.dto';

export class FindAllBannedUsersForBlogCommand {
  constructor(
    public blogId: string,
    public queryData: ParseQueriesDto,
    public currentUser: CurrentUserDto,
  ) {}
}

@CommandHandler(FindAllBannedUsersForBlogCommand)
export class FindAllBannedUsersForBlogUseCase
  implements ICommandHandler<FindAllBannedUsersForBlogCommand>
{
  constructor(
    private readonly caslAbilityFactory: CaslAbilityFactory,
    protected usersRawSqlRepository: UsersRawSqlRepository,
    protected bloggerBlogsRawSqlRepository: BloggerBlogsRawSqlRepository,
    protected bannedUsersForBlogsRawSqlRepository: BannedUsersForBlogsRawSqlRepository,
    protected commandBus: CommandBus,
  ) {}
  async execute(
    command: FindAllBannedUsersForBlogCommand,
  ): Promise<PaginatedResultDto> {
    const { blogId, queryData, currentUser } = command;

    // Check if the blog exists
    const blog = await this.bloggerBlogsRawSqlRepository.findBlogById(
      command.blogId,
    );
    if (!blog) throw new NotFoundException('Not found blog.');

    // Check user's permission to ban the user
    await this.checkUserPermission(currentUser.id, blog.blogOwnerId);

    // Find all banned users for the blog
    const bannedUsers: BannedUsersForBlogsEntity[] =
      await this.bannedUsersForBlogsRawSqlRepository.findBannedUsers(
        blogId,
        queryData,
      );

    // Transform the banned user data into return format
    const transformedBannedUsers: ReturnBannedUsersForBlogEntity[] =
      bannedUsers.map((user: BannedUsersForBlogsEntity) => ({
        id: user.userId,
        login: user.login,
        banInfo: {
          isBanned: user.isBanned,
          banDate: user.banDate,
          banReason: user.banReason,
        },
      }));

    // Get the total count of banned users for pagination purposes
    const totalCount =
      await this.bannedUsersForBlogsRawSqlRepository.countBannedUsersForBlog(
        blogId,
      );

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
}

import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { ParseQueryType } from '../../../common/parse-query/parse-query';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import { UsersRawSqlRepository } from '../../../users/infrastructure/users-raw-sql.repository';
import { BloggerBlogsRawSqlRepository } from '../../infrastructure/blogger-blogs-raw-sql.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../../ability/roles/action.enum';
import { BannedUsersForBlogsRawSqlRepository } from '../../infrastructure/banned-users-for-blogs-raw-sql.repository';
import { PaginationTypes } from '../../../common/pagination/types/pagination.types';
import { ReturnBannedUsersForBlogEntity } from '../../entities/return-banned-users-for-blog.entity';
import { BannedUsersForBlogsEntity } from '../../entities/banned-users-for-blogs.entity';

export class FindAllBannedUsersForBlogCommand {
  constructor(
    public blogId: string,
    public queryData: ParseQueryType,
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
  ): Promise<PaginationTypes> {
    const { blogId, queryData, currentUser } = command;

    const blog = await this.bloggerBlogsRawSqlRepository.findBlogById(
      command.blogId,
    );
    if (!blog) throw new NotFoundException('Not found blog.');

    await this.checkUserPermission(currentUser.id, blog.blogOwnerId);

    const bannedUsers: BannedUsersForBlogsEntity[] =
      await this.bannedUsersForBlogsRawSqlRepository.findBannedUsers(
        blogId,
        queryData,
      );
    const transformedBannedUsers: ReturnBannedUsersForBlogEntity[] =
      bannedUsers.map((i: BannedUsersForBlogsEntity) => ({
        id: i.id,
        login: i.login,
        banInfo: {
          isBanned: i.isBanned,
          banDate: i.banDate,
          banReason: i.banReason,
        },
      }));
    const totalCount =
      await this.bannedUsersForBlogsRawSqlRepository.countBannedUsersForBlog(
        blogId,
      );
    const pagesCount = Math.ceil(
      totalCount / queryData.queryPagination.pageSize,
    );
    return {
      pagesCount: pagesCount,
      page: queryData.queryPagination.pageNumber,
      pageSize: queryData.queryPagination.pageSize,
      totalCount: totalCount,
      items: transformedBannedUsers,
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
}

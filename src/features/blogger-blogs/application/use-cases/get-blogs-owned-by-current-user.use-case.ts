import { ParseQueriesDto } from '../../../../common/query/dto/parse-queries.dto';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PaginatedResultDto } from '../../../../common/pagination/dto/paginated-result.dto';
import { BloggerBlogsRawSqlRepository } from '../../infrastructure/blogger-blogs-raw-sql.repository';
import { BlogsCountBlogsDto } from '../../dto/blogs-count-blogs.dto';

export class GetBlogsOwnedByCurrentUserCommand {
  constructor(
    public queryData: ParseQueriesDto,
    public currentUserDto: CurrentUserDto,
  ) {}
}

@CommandHandler(GetBlogsOwnedByCurrentUserCommand)
export class GetBlogsOwnedByCurrentUserUseCase
  implements ICommandHandler<GetBlogsOwnedByCurrentUserCommand>
{
  constructor(
    protected bloggerBlogsRawSqlRepository: BloggerBlogsRawSqlRepository,
    protected commandBus: CommandBus,
  ) {}
  async execute(
    command: GetBlogsOwnedByCurrentUserCommand,
  ): Promise<PaginatedResultDto> {
    const { queryData, currentUserDto } = command;
    const { pageSize, pageNumber } = queryData.queryPagination;

    const blogsAndCountBlogs: BlogsCountBlogsDto =
      await this.bloggerBlogsRawSqlRepository.searchUserBlogsAndCountBlogs(
        currentUserDto,
        queryData,
      );

    if (blogsAndCountBlogs.countBlogs === 0) {
      return {
        pagesCount: 0,
        page: pageNumber,
        pageSize: pageSize,
        totalCount: 0,
        items: [],
      };
    }

    const totalCount = blogsAndCountBlogs.countBlogs;

    const pagesCount: number = Math.ceil(totalCount / pageSize);
    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: blogsAndCountBlogs.blogs,
    };
  }
}

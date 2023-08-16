import { ParseQueriesDto } from '../../../../common/query/dto/parse-queries.dto';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TableBloggerBlogsRawSqlEntity } from '../../entities/table-blogger-blogs-raw-sql.entity';
import { PaginatedResultDto } from '../../../../common/pagination/dto/paginated-result.dto';
import { BloggerBlogsRawSqlRepository } from '../../infrastructure/blogger-blogs-raw-sql.repository';

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

    const blogs: TableBloggerBlogsRawSqlEntity[] =
      await this.bloggerBlogsRawSqlRepository.searchUserBlogs(
        currentUserDto,
        queryData,
      );

    if (blogs.length === 0) {
      return {
        pagesCount: 0,
        page: pageNumber,
        pageSize: pageSize,
        totalCount: 0,
        items: [],
      };
    }

    const totalCount =
      await this.bloggerBlogsRawSqlRepository.totalCountUserBlogs(
        currentUserDto.id,
        queryData,
      );

    const pagesCount: number = Math.ceil(totalCount / pageSize);
    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: blogs,
    };
  }
}

import { ParseQueriesDto } from '../../../../common/query/dto/parse-queries.dto';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BloggerBlogsRawSqlRepository } from '../../../blogger-blogs/infrastructure/blogger-blogs-raw-sql.repository';
import { PaginatedResultDto } from '../../../../common/pagination/dto/paginated-result.dto';

export class SearchBlogsCommand {
  constructor(public queryData: ParseQueriesDto) {}
}

@CommandHandler(SearchBlogsCommand)
export class SearchBlogsUseCase implements ICommandHandler<SearchBlogsCommand> {
  constructor(
    protected bloggerBlogsRawSqlRepository: BloggerBlogsRawSqlRepository,
    protected commandBus: CommandBus,
  ) {}
  async execute(command: SearchBlogsCommand): Promise<PaginatedResultDto> {
    const { queryData } = command;
    const { pageSize, pageNumber } = queryData.queryPagination;

    const blogs = await this.bloggerBlogsRawSqlRepository.openSearchBlogs(
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

    const totalCount = await this.bloggerBlogsRawSqlRepository.openCountBlogs(
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

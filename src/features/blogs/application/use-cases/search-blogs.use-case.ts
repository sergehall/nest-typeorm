import { ParseQueriesDto } from '../../../../common/query/dto/parse-queries.dto';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PaginatedResultDto } from '../../../../common/pagination/dto/paginated-result.dto';
import { BloggerBlogsRepo } from '../../../blogger-blogs/infrastructure/blogger-blogs.repo';
import { BloggerBlogsService } from '../../../blogger-blogs/application/blogger-blogs.service';

export class SearchBlogsCommand {
  constructor(public queryData: ParseQueriesDto) {}
}

@CommandHandler(SearchBlogsCommand)
export class SearchBlogsUseCase implements ICommandHandler<SearchBlogsCommand> {
  constructor(
    protected commandBus: CommandBus,
    protected bloggerBlogsRepo: BloggerBlogsRepo,
    protected bloggerBlogsService: BloggerBlogsService,
  ) {}
  async execute(command: SearchBlogsCommand): Promise<PaginatedResultDto> {
    const { queryData } = command;
    const { pageSize, pageNumber } = queryData.queryPagination;

    const blogsCountBlogsDto = await this.bloggerBlogsRepo.getBlogsOpenApi(
      queryData,
    );

    if (blogsCountBlogsDto.countBlogs === 0) {
      return {
        pagesCount: 0,
        page: pageNumber,
        pageSize: pageSize,
        totalCount: 0,
        items: [],
      };
    }

    const totalCount = blogsCountBlogsDto.countBlogs;
    const transformedBlogs = await this.bloggerBlogsService.transformedBlogs(
      blogsCountBlogsDto.blogs,
    );

    const pagesCount: number = Math.ceil(totalCount / pageSize);

    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: transformedBlogs,
    };
  }
}

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ParseQueriesDto } from '../../../../common/query/dto/parse-queries.dto';
import { BloggerBlogsRawSqlRepository } from '../../../blogger-blogs/infrastructure/blogger-blogs-raw-sql.repository';
import { TableBloggerBlogsRawSqlEntity } from '../../../blogger-blogs/entities/table-blogger-blogs-raw-sql.entity';

export class SearchBlogsForSaCommand {
  constructor(public queryData: ParseQueriesDto) {}
}

@CommandHandler(SearchBlogsForSaCommand)
export class SearchBlogsForSaUseCase
  implements ICommandHandler<SearchBlogsForSaCommand>
{
  constructor(
    protected bloggerBlogsRawSqlRepository: BloggerBlogsRawSqlRepository,
  ) {}
  async execute(command: SearchBlogsForSaCommand) {
    const { queryData } = command;
    const { pageNumber, pageSize } = queryData.queryPagination;

    const blogs: TableBloggerBlogsRawSqlEntity[] =
      await this.bloggerBlogsRawSqlRepository.searchBlogsForSa(queryData);

    if (blogs.length === 0) {
      return {
        pagesCount: 0,
        page: pageNumber,
        pageSize: pageSize,
        totalCount: 0,
        items: [],
      };
    }

    const transformedArrBlogs = blogs.map(
      (blog: TableBloggerBlogsRawSqlEntity) => ({
        id: blog.id,
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
        createdAt: blog.createdAt,
        isMembership: blog.isMembership,
        blogOwnerInfo: {
          userId: blog.blogOwnerId,
          userLogin: blog.blogOwnerLogin,
        },
        banInfo: {
          isBanned: blog.banInfoIsBanned,
          banDate: blog.banInfoBanDate,
        },
      }),
    );
    const totalCount =
      await this.bloggerBlogsRawSqlRepository.saTotalCountBlogs(queryData);

    const pagesCount = Math.ceil(totalCount / pageSize);

    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: transformedArrBlogs,
    };
  }
}

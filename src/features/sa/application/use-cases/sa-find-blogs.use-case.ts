import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ParseQueriesDto } from '../../../../common/query/dto/parse-queries.dto';
import { BloggerBlogsRepo } from '../../../blogger-blogs/infrastructure/blogger-blogs.repo';
import { BloggerBlogsEntity } from '../../../blogger-blogs/entities/blogger-blogs.entity';
import { BlogsCountBlogsDto } from '../../../blogger-blogs/dto/blogs-count-blogs.dto';
import { PaginatorDto } from '../../../../common/pagination/dto/paginator.dto';

export class SaFindBlogsCommand {
  constructor(public queryData: ParseQueriesDto) {}
}

@CommandHandler(SaFindBlogsCommand)
export class SaFindBlogsUseCase implements ICommandHandler<SaFindBlogsCommand> {
  constructor(protected bloggerBlogsRepo: BloggerBlogsRepo) {}
  async execute(command: SaFindBlogsCommand): Promise<PaginatorDto> {
    const { queryData } = command;
    const { pageNumber, pageSize } = queryData.queryPagination;

    const blogsAndCount: BlogsCountBlogsDto =
      await this.bloggerBlogsRepo.searchBlogsForSa(queryData);

    if (blogsAndCount.blogs.length === 0) {
      return {
        pagesCount: 0,
        page: pageNumber,
        pageSize: pageSize,
        totalCount: 0,
        items: [],
      };
    }

    const transformedArrBlogs = blogsAndCount.blogs.map(
      (blog: BloggerBlogsEntity) => ({
        id: blog.id,
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
        createdAt: blog.createdAt,
        isMembership: blog.isMembership,
        blogOwnerInfo: {
          userId: blog.blogOwner.userId,
          userLogin: blog.blogOwner.login,
        },
        banInfo: {
          isBanned: blog.banInfoIsBanned,
          banDate: blog.banInfoBanDate,
        },
      }),
    );

    const totalCount = blogsAndCount.countBlogs;

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

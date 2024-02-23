import { ParseQueriesDto } from '../../../../common/query/dto/parse-queries.dto';
import { CurrentUserDto } from '../../../users/dto/current-user.dto';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PaginatorDto } from '../../../../common/helpers/paginator.dto';
import { BlogsCountBlogsDto } from '../../dto/blogs-count-blogs.dto';
import { BloggerBlogsRepo } from '../../infrastructure/blogger-blogs.repo';
import { BloggerBlogsService } from '../blogger-blogs.service';
import { BloggerBlogsViewModel } from '../../views/blogger-blogs.view-model';

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
    protected commandBus: CommandBus,
    protected bloggerBlogsService: BloggerBlogsService,
    protected bloggerBlogsRepo: BloggerBlogsRepo,
  ) {}
  async execute(
    command: GetBlogsOwnedByCurrentUserCommand,
  ): Promise<PaginatorDto> {
    const { queryData, currentUserDto } = command;
    const { pageSize, pageNumber } = queryData.queryPagination;

    const blogsCountBlogsDto: BlogsCountBlogsDto =
      await this.bloggerBlogsRepo.getBlogsOwnedByCurrentUser(
        currentUserDto,
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

    const totalCount: number = blogsCountBlogsDto.countBlogs;

    const transformedBlogs: BloggerBlogsViewModel[] =
      await this.bloggerBlogsService.transformedBlogs(blogsCountBlogsDto.blogs);

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

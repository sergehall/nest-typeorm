import { ParseQueriesDto } from '../../../../common/query/dto/parse-queries.dto';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PaginatorDto } from '../../../../common/helpers/paginator.dto';
import { BloggerBlogsRepo } from '../../../blogger-blogs/infrastructure/blogger-blogs.repo';
import { BloggerBlogsService } from '../../../blogger-blogs/application/blogger-blogs.service';
import { BloggerBlogsWithImagesViewModel } from '../../../blogger-blogs/views/blogger-blogs-with-images.view-model';
import { BlogsSubscribersRepo } from '../../../blogger-blogs/infrastructure/blogs-subscribers.repo';
import { BlogIdSubscriptionStatusAndCountType } from '../../../blogger-blogs/types/blogId-subscription-status-and-count.type';
import { CurrentUserDto } from '../../../users/dto/current-user.dto';
import { BlogsService } from '../blogs.service';
import { BloggerBlogsWithImagesSubscribersViewModel } from '../../../blogger-blogs/views/blogger-blogs-with-images-subscribers.view-model';

export class SearchBlogsCommand {
  constructor(
    public queryData: ParseQueriesDto,
    public currentUserDto: CurrentUserDto | null,
  ) {}
}

@CommandHandler(SearchBlogsCommand)
export class SearchBlogsUseCase implements ICommandHandler<SearchBlogsCommand> {
  constructor(
    protected commandBus: CommandBus,
    protected bloggerBlogsRepo: BloggerBlogsRepo,
    protected bloggerBlogsService: BloggerBlogsService,
    protected blogsSubscribersRepo: BlogsSubscribersRepo,
  ) {}
  async execute(command: SearchBlogsCommand): Promise<PaginatorDto> {
    const { queryData, currentUserDto } = command;
    const { pageSize, pageNumber } = queryData.queryPagination;

    const blogsCountBlogsDto = await this.bloggerBlogsRepo.getBlogsPublic(
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

    const blogIds = blogsCountBlogsDto.blogs.map((blog) => blog.id);

    const blogsWithImages: BloggerBlogsWithImagesViewModel[] =
      await this.bloggerBlogsService.blogsImagesAggregation(
        blogsCountBlogsDto.blogs,
      );

    const blogsSubscribers: BlogIdSubscriptionStatusAndCountType[] =
      await this.blogsSubscribersRepo.blogsSubscribers(blogIds, currentUserDto);

    const blogs: BloggerBlogsWithImagesSubscribersViewModel[] =
      await this.bloggerBlogsService.mapBlogsWithImagesAndSubscription(
        blogsWithImages,
        blogsSubscribers,
      );

    const totalCount = blogsCountBlogsDto.countBlogs;

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

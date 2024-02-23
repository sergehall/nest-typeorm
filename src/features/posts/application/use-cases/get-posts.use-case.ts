import { CurrentUserDto } from '../../../users/dto/current-user.dto';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ParseQueriesDto } from '../../../../common/query/dto/parse-queries.dto';
import { PaginatorDto } from '../../../../common/helpers/paginator.dto';
import { PostsAndCountDto } from '../../dto/posts-and-count.dto';
import { PostsRepo } from '../../infrastructure/posts-repo';

export class GetPostsCommand {
  constructor(
    public queryData: ParseQueriesDto,
    public currentUserDto: CurrentUserDto | null,
  ) {}
}

@CommandHandler(GetPostsCommand)
export class GetPostsUseCase implements ICommandHandler<GetPostsCommand> {
  constructor(
    protected postsRepo: PostsRepo,
    protected commandBus: CommandBus,
  ) {}
  async execute(command: GetPostsCommand): Promise<PaginatorDto> {
    const { queryData, currentUserDto } = command;
    const { pageNumber, pageSize } = queryData.queryPagination;

    const postsAndCount: PostsAndCountDto =
      await this.postsRepo.getPostsWithPaginationAndCount(
        queryData,
        currentUserDto,
      );

    if (postsAndCount.posts.length === 0) {
      return {
        pagesCount: 0,
        page: pageNumber,
        pageSize: pageSize,
        totalCount: 0,
        items: postsAndCount.posts,
      };
    }
    const totalCount = postsAndCount.countPosts;

    const pagesCount: number = Math.ceil(totalCount / pageSize);

    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: postsAndCount.posts,
    };
  }
}

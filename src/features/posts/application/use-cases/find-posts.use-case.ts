import { ParseQueriesType } from '../../../common/query/types/parse-query.types';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRawSqlRepository } from '../../infrastructure/posts-raw-sql.repository';
import { ReturnPostsNumberOfPostsEntity } from '../../entities/return-posts-number-of-posts.entity';

export class FindPostsCommand {
  constructor(
    public queryData: ParseQueriesType,
    public currentUserDto: CurrentUserDto | null,
  ) {}
}

@CommandHandler(FindPostsCommand)
export class FindPostsUseCase implements ICommandHandler<FindPostsCommand> {
  constructor(
    private readonly postsRawSqlRepository: PostsRawSqlRepository,
    protected commandBus: CommandBus,
  ) {}
  async execute(command: FindPostsCommand) {
    const { queryData, currentUserDto } = command;
    const { pageNumber, pageSize } = queryData.queryPagination;

    const postsAndNumberOfPosts: ReturnPostsNumberOfPostsEntity =
      await this.postsRawSqlRepository.findPostsAndTotalCountPosts(
        queryData,
        currentUserDto,
      );

    const totalCount = postsAndNumberOfPosts.numberOfPosts;

    if (totalCount === 0) {
      return {
        pagesCount: pageNumber,
        page: pageNumber,
        pageSize: pageSize,
        totalCount: pageNumber - 1,
        items: [],
      };
    }
    return {
      pagesCount: pageNumber,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: postsAndNumberOfPosts.posts,
    };
  }
}

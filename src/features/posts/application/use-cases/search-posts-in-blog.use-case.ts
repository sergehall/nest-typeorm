import { ParseQueriesDto } from '../../../../common/query/dto/parse-queries.dto';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRawSqlRepository } from '../../infrastructure/posts-raw-sql.repository';
import { PostsCountPostsDto } from '../../dto/posts-count-posts.dto';

export class SearchPostsInBlogCommand {
  constructor(
    public blogId: string,
    public queryData: ParseQueriesDto,
    public currentUserDto: CurrentUserDto | null,
  ) {}
}
@CommandHandler(SearchPostsInBlogCommand)
export class SearchPostsInBlogUseCase
  implements ICommandHandler<SearchPostsInBlogCommand>
{
  constructor(protected postsRawSqlRepository: PostsRawSqlRepository) {}
  async execute(command: SearchPostsInBlogCommand) {
    const { blogId, queryData, currentUserDto } = command;
    const { pageNumber, pageSize } = queryData.queryPagination;

    const postsAndNumberOfPosts: PostsCountPostsDto =
      await this.postsRawSqlRepository.findPostsAndTotalCountPostsForBlog(
        blogId,
        queryData,
        currentUserDto,
      );

    const totalCount = postsAndNumberOfPosts.countPosts;

    if (totalCount === 0) {
      return {
        pagesCount: pageNumber,
        page: pageNumber,
        pageSize: pageSize,
        totalCount: pageNumber - 1,
        items: postsAndNumberOfPosts.posts,
      };
    }

    const pagesCount: number = Math.ceil(totalCount / pageSize);

    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: postsAndNumberOfPosts.posts,
    };
  }
}

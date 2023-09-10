import { ParseQueriesDto } from '../../../../common/query/dto/parse-queries.dto';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepo } from '../../infrastructure/posts-repo';
import { PostsAndCountDto } from '../../dto/posts-and-count.dto';

export class GetPostsInBlogCommand {
  constructor(
    public blogId: string,
    public queryData: ParseQueriesDto,
    public currentUserDto: CurrentUserDto | null,
  ) {}
}
@CommandHandler(GetPostsInBlogCommand)
export class GetPostsInBlogUseCase
  implements ICommandHandler<GetPostsInBlogCommand>
{
  constructor(protected postsRepo: PostsRepo) {}
  async execute(command: GetPostsInBlogCommand) {
    const { blogId, queryData, currentUserDto } = command;
    const { pageNumber, pageSize } = queryData.queryPagination;

    const postsAndNumberOfPosts: PostsAndCountDto =
      await this.postsRepo.getPostsInBlogWithPagination(
        blogId,
        queryData,
        currentUserDto,
      );

    const totalCount = postsAndNumberOfPosts.countPosts;

    if (postsAndNumberOfPosts.countPosts === 0) {
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

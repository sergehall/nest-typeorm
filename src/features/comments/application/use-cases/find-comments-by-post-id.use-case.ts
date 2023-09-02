import { NotFoundException } from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { CommentsRawSqlRepository } from '../../infrastructure/comments-raw-sql.repository';
import { ParseQueriesDto } from '../../../../common/query/dto/parse-queries.dto';
import { PaginatedResultDto } from '../../../../common/pagination/dto/paginated-result.dto';
import { ReturnCommentsCountCommentsDto } from '../../dto/return-comments-count-comments.dto';
import { PostsRepo } from '../../../posts/infrastructure/posts-repo';

export class FindCommentsByPostIdCommand {
  constructor(
    public postId: string,
    public queryData: ParseQueriesDto,
    public currentUserDto: CurrentUserDto | null,
  ) {}
}

@CommandHandler(FindCommentsByPostIdCommand)
export class FindCommentsByPostIdUseCase
  implements ICommandHandler<FindCommentsByPostIdCommand>
{
  constructor(
    private readonly postsRepo: PostsRepo,
    private readonly commentsRawSqlRepository: CommentsRawSqlRepository,
    protected commandBus: CommandBus,
  ) {}
  async execute(
    command: FindCommentsByPostIdCommand,
  ): Promise<PaginatedResultDto> {
    const { postId, queryData, currentUserDto } = command;
    const { pageNumber, pageSize } = queryData.queryPagination;

    const post = await this.postsRepo.getPostByIdWithoutLikes(postId);
    if (!post) throw new NotFoundException(`Post with ID ${postId} not found`);

    const commentsAndCountComments: ReturnCommentsCountCommentsDto =
      await this.commentsRawSqlRepository.findCommentsByPostIdAndCountOfLikesDislikes(
        postId,
        queryData,
        currentUserDto,
      );

    const { comments, countComments } = commentsAndCountComments;

    if (countComments === 0) {
      return {
        pagesCount: pageNumber,
        page: pageNumber,
        pageSize: pageSize,
        totalCount: pageNumber - 1,
        items: [],
      };
    }

    const pagesCount = Math.ceil(
      countComments / queryData.queryPagination.pageSize,
    );

    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: countComments,
      items: comments,
    };
  }
}

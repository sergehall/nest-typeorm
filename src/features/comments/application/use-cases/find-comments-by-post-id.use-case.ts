import { NotFoundException } from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { PostsRawSqlRepository } from '../../../posts/infrastructure/posts-raw-sql.repository';
import { ParseQueriesType } from '../../../common/query/types/parse-query.types';
import { CommentsRawSqlRepository } from '../../infrastructure/comments-raw-sql.repository';
import { CommentsLikesStatusLikesDislikesTotalComments } from '../../entities/comment-likes-dislikes-likes-status';
import { ReturnCommentsEntity } from '../../entities/return-comments.entity';

export class FindCommentsByPostIdCommand {
  constructor(
    public postId: string,
    public queryData: ParseQueriesType,
    public currentUserDto: CurrentUserDto | null,
  ) {}
}

@CommandHandler(FindCommentsByPostIdCommand)
export class FindCommentsByPostIdUseCase
  implements ICommandHandler<FindCommentsByPostIdCommand>
{
  constructor(
    private readonly postsRawSqlRepository: PostsRawSqlRepository,
    private readonly commentsRawSqlRepository: CommentsRawSqlRepository,
    protected commandBus: CommandBus,
  ) {}
  async execute(command: FindCommentsByPostIdCommand) {
    const { postId, queryData, currentUserDto } = command;

    const post = await this.postsRawSqlRepository.findPostByPostId(postId);
    if (!post) throw new NotFoundException('Not found post.');

    const comments: CommentsLikesStatusLikesDislikesTotalComments[] =
      await this.commentsRawSqlRepository.findComments(
        postId,
        queryData,
        currentUserDto,
      );

    if (comments.length === 0) {
      return {
        pagesCount: queryData.queryPagination.pageNumber,
        page: queryData.queryPagination.pageNumber,
        pageSize: queryData.queryPagination.pageSize,
        totalCount: queryData.queryPagination.pageNumber - 1,
        items: [],
      };
    }

    const transformedComments = await this.transformedComments(comments);

    const totalCountComments = Number(comments[0].numberOfComments);

    const pagesCount = Math.ceil(
      totalCountComments / queryData.queryPagination.pageSize,
    );

    return {
      pagesCount: pagesCount,
      page: queryData.queryPagination.pageNumber,
      pageSize: queryData.queryPagination.pageSize,
      totalCount: totalCountComments,
      items: transformedComments,
    };
  }

  private async transformedComments(
    comments: CommentsLikesStatusLikesDislikesTotalComments[],
  ): Promise<ReturnCommentsEntity[]> {
    return comments.map(
      (
        comment: CommentsLikesStatusLikesDislikesTotalComments,
      ): ReturnCommentsEntity => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        commentatorInfo: {
          userId: comment.commentatorInfoUserId,
          userLogin: comment.commentatorInfoUserLogin,
        },
        likesInfo: {
          likesCount: comment.numberOfLikes,
          dislikesCount: comment.numberOfDislikes,
          myStatus: comment.likeStatus,
        },
      }),
    );
  }
}

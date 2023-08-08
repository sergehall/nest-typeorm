import { NotFoundException } from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { PostsRawSqlRepository } from '../../../posts/infrastructure/posts-raw-sql.repository';
import { ParseQueriesType } from '../../../common/query/types/parse-query.types';
import { CommentsRawSqlRepository } from '../../infrastructure/comments-raw-sql.repository';
import { ReturnCommentsEntity } from '../../entities/return-comments.entity';
import { CommentsNumberOfLikesDislikesLikesStatus } from '../../entities/comment-likes-dislikes-likes-status';
import { PaginationTypes } from '../../../common/pagination/types/pagination.types';

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
  async execute(
    command: FindCommentsByPostIdCommand,
  ): Promise<PaginationTypes> {
    const { postId, queryData, currentUserDto } = command;
    const { pageNumber, pageSize } = queryData.queryPagination;

    const post = await this.postsRawSqlRepository.getPostById(postId);
    if (!post) throw new NotFoundException('Not found post.');

    // let comments: CommentsNumberOfLikesDislikesLikesStatus[];
    // switch (currentUserDto) {
    //   case null:
    //     comments =
    //       await this.commentsRawSqlRepository.findCommentsByUserNotExist(
    //         postId,
    //         queryData,
    //       );
    //     break;
    //   default:
    //     comments = await this.commentsRawSqlRepository.findCommentsByUserExist(
    //       postId,
    //       queryData,
    //       currentUserDto,
    //     );
    //     break;
    // }
    const comments =
      await this.commentsRawSqlRepository.findCommentsByUserNotExist2(
        postId,
        queryData,
        currentUserDto,
      );

    if (comments.length === 0) {
      return {
        pagesCount: pageNumber,
        page: pageNumber,
        pageSize: pageSize,
        totalCount: pageNumber - 1,
        items: [],
      };
    }

    const transformedComments: ReturnCommentsEntity[] =
      await this.transformedComments(comments);

    const totalCountComments: number = comments[0].numberOfComments;

    const pagesCount = Math.ceil(
      totalCountComments / queryData.queryPagination.pageSize,
    );

    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCountComments,
      items: transformedComments,
    };
  }

  private async transformedComments(
    comments: CommentsNumberOfLikesDislikesLikesStatus[],
  ): Promise<ReturnCommentsEntity[]> {
    return comments.map(
      (
        comment: CommentsNumberOfLikesDislikesLikesStatus,
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

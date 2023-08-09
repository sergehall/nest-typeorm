import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { CommentsRawSqlRepository } from '../../../comments/infrastructure/comments-raw-sql.repository';
import { ParseQueriesType } from '../../../common/query/types/parse-query.types';
import { CommentsNumberOfLikesDislikesLikesStatus } from '../../../comments/entities/comment-likes-dislikes-likes-status';
import { ReturnCommentsEntity } from '../../../comments/entities/return-comments.entity';
import { ReturnCommentsWithPostInfoEntity } from '../../../comments/entities/return-comments-with-post-info.entity';

export class FindCommentsCurrentUserCommand {
  constructor(
    public queryData: ParseQueriesType,
    public currentUserDto: CurrentUserDto,
  ) {}
}

@CommandHandler(FindCommentsCurrentUserCommand)
export class FindCommentsCurrentUserUseCase
  implements ICommandHandler<FindCommentsCurrentUserCommand>
{
  constructor(
    protected commentsRawSqlRepository: CommentsRawSqlRepository,
    protected commandBus: CommandBus,
  ) {}
  async execute(command: FindCommentsCurrentUserCommand) {
    const { queryData, currentUserDto } = command;
    const { pageNumber, pageSize } = queryData.queryPagination;
    const { id } = currentUserDto;

    // const comments: TablesCommentsRawSqlEntity[] =
    //   await this.commentsRawSqlRepository.findCommentsByCommentatorId(
    //     id,
    //     queryData,
    //   );

    const comment2: CommentsNumberOfLikesDislikesLikesStatus[] =
      await this.commentsRawSqlRepository.findCommentByCommentatorIdAndCountOfLikesDislikesComments(
        id,
        queryData,
        currentUserDto,
      );

    if (comment2.length === 0) {
      return {
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      };
    }

    const totalCount: number = comment2[0].numberOfComments;

    const transformedComments: ReturnCommentsEntity[] =
      await this.transformedComments(comment2);

    // const filledComments = await this.commandBus.execute(
    //   new FillingCommentsDataCommand(comments, command.currentUserDto),
    // );

    // const totalCountComments =
    //   await this.commentsRawSqlRepository.totalCountCommentsByCommentatorId(id);

    const pagesCount = Math.ceil(
      totalCount / command.queryData.queryPagination.pageSize,
    );

    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: transformedComments,
    };
  }

  private async transformedComments(
    comments: CommentsNumberOfLikesDislikesLikesStatus[],
  ): Promise<ReturnCommentsWithPostInfoEntity[]> {
    return comments.map(
      (
        comment: CommentsNumberOfLikesDislikesLikesStatus,
      ): ReturnCommentsWithPostInfoEntity => ({
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
        postInfo: {
          id: comment.postInfoPostId,
          title: comment.postInfoTitle,
          blogId: comment.postInfoBlogId,
          blogName: comment.postInfoBlogName,
        },
      }),
    );
  }
}

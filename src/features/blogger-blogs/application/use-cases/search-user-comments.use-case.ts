import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { CommentsRawSqlRepository } from '../../../comments/infrastructure/comments-raw-sql.repository';
import { ReturnCommentsEntity } from '../../../comments/entities/return-comments.entity';
import { ReturnCommentsWithPostInfoEntity } from '../../../comments/entities/return-comments-with-post-info.entity';
import { CommentsCountLikesDislikesEntity } from '../../../comments/entities/comments-count-likes-dislikes.entity';
import { ParseQueriesDto } from '../../../../common/query/dto/parse-queries.dto';
import { PaginatedResultDto } from '../../../../common/pagination/dto/paginated-result.dto';

export class SearchUserCommentsCommand {
  constructor(
    public queryData: ParseQueriesDto,
    public currentUserDto: CurrentUserDto,
  ) {}
}

@CommandHandler(SearchUserCommentsCommand)
export class SearchUserCommentsUseCase
  implements ICommandHandler<SearchUserCommentsCommand>
{
  constructor(
    protected commentsRawSqlRepository: CommentsRawSqlRepository,
    protected commandBus: CommandBus,
  ) {}
  async execute(
    command: SearchUserCommentsCommand,
  ): Promise<PaginatedResultDto> {
    const { queryData, currentUserDto } = command;
    const { pageNumber, pageSize } = queryData.queryPagination;
    const { id } = currentUserDto;

    const comments: CommentsCountLikesDislikesEntity[] =
      await this.commentsRawSqlRepository.findAllNotBannedCommentsAndCountLikesDislikes(
        id,
        queryData,
        currentUserDto,
      );
    if (comments.length === 0) {
      return {
        pagesCount: 0,
        page: pageNumber,
        pageSize: pageSize,
        totalCount: 0,
        items: [],
      };
    }

    const totalCount: number = comments[0].countComments;

    const transformedComments: ReturnCommentsEntity[] =
      await this.transformedComments(comments);

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
    comments: CommentsCountLikesDislikesEntity[],
  ): Promise<ReturnCommentsWithPostInfoEntity[]> {
    return comments.map(
      (
        comment: CommentsCountLikesDislikesEntity,
      ): ReturnCommentsWithPostInfoEntity => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        commentatorInfo: {
          userId: comment.commentatorInfoUserId,
          userLogin: comment.commentatorInfoUserLogin,
        },
        likesInfo: {
          likesCount: comment.countLikes,
          dislikesCount: comment.countDislikes,
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

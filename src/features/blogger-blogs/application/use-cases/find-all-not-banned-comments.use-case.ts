import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { CommentsRawSqlRepository } from '../../../comments/infrastructure/comments-raw-sql.repository';
import { ParseQueriesType } from '../../../common/query/types/parse-query.types';
import { ReturnCommentsEntity } from '../../../comments/entities/return-comments.entity';
import { ReturnCommentsWithPostInfoEntity } from '../../../comments/entities/return-comments-with-post-info.entity';
import { CommentsCountLikesDislikesEntity } from '../../../comments/entities/comments-count-likes-dislikes.entity';

export class FindAllNotBannedCommentsCommand {
  constructor(
    public queryData: ParseQueriesType,
    public currentUserDto: CurrentUserDto,
  ) {}
}

@CommandHandler(FindAllNotBannedCommentsCommand)
export class FindAllNotBannedCommentsUseCase
  implements ICommandHandler<FindAllNotBannedCommentsCommand>
{
  constructor(
    protected commentsRawSqlRepository: CommentsRawSqlRepository,
    protected commandBus: CommandBus,
  ) {}
  async execute(command: FindAllNotBannedCommentsCommand) {
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
        page: 1,
        pageSize: 10,
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

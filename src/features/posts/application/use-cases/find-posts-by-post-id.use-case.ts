import { NotFoundException } from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { PostsRawSqlRepository } from '../../infrastructure/posts-raw-sql.repository';
import { ParseQueriesType } from '../../../common/query/types/parse-query.types';
import { CommentsRawSqlRepository } from '../../../comments/infrastructure/comments-raw-sql.repository';
import { TablesCommentsRawSqlEntity } from '../../../comments/entities/tables-comments-raw-sql.entity';
import { FilledCommentEntity } from '../../../comments/entities/filledComment.entity';
import { FillingCommentsDataCommand } from '../../../comments/application/use-cases/filling-comments-data.use-case';
import { ReturnCommentsEntity } from '../../../comments/entities/return-comments.entity';

export class FindPostsByPostIdCommand {
  constructor(
    public postId: string,
    public queryData: ParseQueriesType,
    public currentUserDto: CurrentUserDto | null,
  ) {}
}

@CommandHandler(FindPostsByPostIdCommand)
export class FindPostsByPostIdUseCase
  implements ICommandHandler<FindPostsByPostIdCommand>
{
  constructor(
    private readonly postsRawSqlRepository: PostsRawSqlRepository,
    private readonly commentsRawSqlRepository: CommentsRawSqlRepository,
    protected commandBus: CommandBus,
  ) {}
  async execute(command: FindPostsByPostIdCommand) {
    const { postId, queryData, currentUserDto } = command;

    const post = await this.postsRawSqlRepository.findPostByPostId(postId);
    if (!post) throw new NotFoundException('Not found post.');

    const comments: TablesCommentsRawSqlEntity[] =
      await this.commentsRawSqlRepository.findCommentsByPostId(
        postId,
        queryData,
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

    const filledComments: FilledCommentEntity[] = await this.commandBus.execute(
      new FillingCommentsDataCommand(comments, currentUserDto),
    );

    const totalCountComments =
      await this.commentsRawSqlRepository.totalCountCommentsByPostId(postId);

    const pagesCount = Math.ceil(
      totalCountComments / queryData.queryPagination.pageSize,
    );
    const commentsWithoutPostInfo: ReturnCommentsEntity[] = filledComments.map(
      (currentComment: FilledCommentEntity) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { postInfo, ...commentWithoutPostInfo } = currentComment;

        return commentWithoutPostInfo;
      },
    );
    return {
      pagesCount: pagesCount,
      page: queryData.queryPagination.pageNumber,
      pageSize: queryData.queryPagination.pageSize,
      totalCount: totalCountComments,
      items: commentsWithoutPostInfo,
    };
  }
}

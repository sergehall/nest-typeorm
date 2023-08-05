import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { CommentsRawSqlRepository } from '../../infrastructure/comments-raw-sql.repository';
import { FilledCommentEntity } from '../../entities/filledComment.entity';
import { FillingCommentsDataCommand } from './filling-comments-data.use-case';
import { ReturnCommentsEntity } from '../../entities/comments-return.entity';
import { TablesCommentsRawSqlEntity } from '../../entities/tables-comments-raw-sql.entity';

export class FindCommentByIdCommand {
  constructor(
    public commentId: string,
    public currentUserDto: CurrentUserDto | null,
  ) {}
}

@CommandHandler(FindCommentByIdCommand)
export class FindCommentByIdUseCase
  implements ICommandHandler<FindCommentByIdCommand>
{
  constructor(
    protected commandBus: CommandBus,
    protected commentsRawSqlRepository: CommentsRawSqlRepository,
  ) {}
  async execute(
    command: FindCommentByIdCommand,
  ): Promise<ReturnCommentsEntity> {
    const { commentId, currentUserDto } = command;

    const comment: TablesCommentsRawSqlEntity | null =
      await this.commentsRawSqlRepository.findCommentByCommentId(commentId);

    if (!comment || comment.commentatorInfoIsBanned)
      throw new NotFoundException(
        'Not found comment or commentator is banned.',
      );

    const filledComments: FilledCommentEntity[] = await this.commandBus.execute(
      new FillingCommentsDataCommand([comment], currentUserDto),
    );

    return {
      id: filledComments[0].id,
      content: filledComments[0].content,
      createdAt: filledComments[0].createdAt,
      commentatorInfo: {
        userId: filledComments[0].commentatorInfo.userId,
        userLogin: filledComments[0].commentatorInfo.userLogin,
      },
      likesInfo: {
        likesCount: filledComments[0].likesInfo.likesCount,
        dislikesCount: filledComments[0].likesInfo.dislikesCount,
        myStatus: filledComments[0].likesInfo.myStatus,
      },
    };
  }
}

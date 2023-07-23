import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InternalServerErrorException } from '@nestjs/common';
import { LikeStatusCommentsRawSqlRepository } from '../../infrastructure/like-status-comments-raw-sql.repository';
import { CommentsRawSqlRepository } from '../../infrastructure/comments-raw-sql.repository';

export class ChangeBanStatusCommentsByBlogIdCommand {
  constructor(public blogId: string, public isBanned: boolean) {}
}
@CommandHandler(ChangeBanStatusCommentsByBlogIdCommand)
export class ChangeBanStatusCommentsByBlogIdUseCase
  implements ICommandHandler<ChangeBanStatusCommentsByBlogIdCommand>
{
  constructor(
    protected commentsRawSqlRepository: CommentsRawSqlRepository,
    protected likeStatusCommentsRawSqlRepository: LikeStatusCommentsRawSqlRepository,
  ) {}
  async execute(command: ChangeBanStatusCommentsByBlogIdCommand) {
    const { blogId, isBanned } = command;
    try {
      await Promise.all([
        this.commentsRawSqlRepository.changeBanStatusCommentsByBlogId(
          blogId,
          isBanned,
        ),
        this.likeStatusCommentsRawSqlRepository.changeBanStatusLikesCommentsByBlogId(
          blogId,
          isBanned,
        ),
      ]);
      return true;
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }
}

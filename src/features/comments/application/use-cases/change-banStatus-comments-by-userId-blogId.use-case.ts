import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BannedUsersForBlogsEntity } from '../../../blogger-blogs/entities/banned-users-for-blogs.entity';
import { CommentsRawSqlRepository } from '../../infrastructure/comments-raw-sql.repository';
import { LikeStatusCommentsRawSqlRepository } from '../../infrastructure/like-status-comments-raw-sql.repository';
import { InternalServerErrorException } from '@nestjs/common';

export class ChangeBanStatusCommentsByUserIdBlogIdCommand {
  constructor(public bannedUserForBlogEntity: BannedUsersForBlogsEntity) {}
}

@CommandHandler(ChangeBanStatusCommentsByUserIdBlogIdCommand)
export class ChangeBanStatusCommentsByUserIdBlogIdUseCase
  implements ICommandHandler<ChangeBanStatusCommentsByUserIdBlogIdCommand>
{
  constructor(
    protected likeStatusCommentsRawSqlRepository: LikeStatusCommentsRawSqlRepository,
    protected commentsRawSqlRepository: CommentsRawSqlRepository,
  ) {}
  async execute(
    command: ChangeBanStatusCommentsByUserIdBlogIdCommand,
  ): Promise<boolean> {
    const { bannedUserForBlogEntity } = command;
    try {
      await Promise.all([
        this.likeStatusCommentsRawSqlRepository.changeBanStatusLikesCommentsByUserIdBlogId(
          bannedUserForBlogEntity,
        ),
        this.commentsRawSqlRepository.changeBanStatusCommentsByUserIdBlogId(
          bannedUserForBlogEntity,
        ),
      ]);
      return true;
    } catch (error) {
      // If an error occurs during the execution of repository methods, log the error and rethrow it as an InternalServerErrorException
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }
}

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BannedUsersForBlogsEntity } from '../../../blogger-blogs/entities/banned-users-for-blogs.entity';
import { CommentsRawSqlRepository } from '../../infrastructure/comments-raw-sql.repository';
import { LikeStatusCommentsRawSqlRepository } from '../../infrastructure/like-status-comments-raw-sql.repository';

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
    await this.commentsRawSqlRepository.changeBanStatusCommentsByUserIdBlogId(
      command.bannedUserForBlogEntity,
    );
    await this.likeStatusCommentsRawSqlRepository.changeBanStatusLikesCommentsByUserIdBlogId(
      command.bannedUserForBlogEntity,
    );
    return true;
  }
}

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRawSqlRepository } from '../../infrastructure/comments-raw-sql.repository';
import { LikeStatusCommentsRawSqlRepository } from '../../infrastructure/like-status-comments-raw-sql.repository';
import { InternalServerErrorException } from '@nestjs/common';

export class ChangeBanStatusUserCommentsCommand {
  constructor(public userId: string, public isBanned: boolean) {}
}

@CommandHandler(ChangeBanStatusUserCommentsCommand)
export class ChangeBanStatusCommentsUseCase
  implements ICommandHandler<ChangeBanStatusUserCommentsCommand>
{
  constructor(
    private readonly commentsRawSqlRepository: CommentsRawSqlRepository,
    private readonly likeStatusCommentsRawSqlRepository: LikeStatusCommentsRawSqlRepository,
  ) {}

  async execute(command: ChangeBanStatusUserCommentsCommand): Promise<boolean> {
    const { userId, isBanned } = command;

    try {
      // Use Promise.all to execute the repository methods concurrently
      await Promise.all([
        this.commentsRawSqlRepository.changeBanStatusCommentatorsByUserId(
          userId,
          isBanned,
        ),
        this.likeStatusCommentsRawSqlRepository.changeBanStatusCommentsLikesByUserId(
          userId,
          isBanned,
        ),
      ]);

      return true;
    } catch (error) {
      // Handle errors and throw a custom exception with the error message
      throw new InternalServerErrorException(
        `Failed to change ban status: ${error.message}`,
      );
    }
  }
}

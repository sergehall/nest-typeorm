import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRawSqlRepository } from '../../infrastructure/posts-raw-sql.repository';
import { InternalServerErrorException } from '@nestjs/common';
import { LikeStatusPostsRawSqlRepository } from '../../infrastructure/like-status-posts-raw-sql.repository';

export class ChangeBanStatusUserPostsCommand {
  constructor(public userId: string, public isBanned: boolean) {}
}

@CommandHandler(ChangeBanStatusUserPostsCommand)
export class ChangeBanStatusPostsUseCase
  implements ICommandHandler<ChangeBanStatusUserPostsCommand>
{
  constructor(
    protected postsRawSqlRepository: PostsRawSqlRepository,
    protected likeStatusPostsRawSqlRepository: LikeStatusPostsRawSqlRepository,
  ) {}
  async execute(command: ChangeBanStatusUserPostsCommand): Promise<boolean> {
    try {
      // Use Promise.all to execute the repository methods concurrently
      const { userId, isBanned } = command;
      await Promise.all([
        this.postsRawSqlRepository.changeBanStatusPostOwnerByUserId(
          userId,
          isBanned,
        ),
        this.likeStatusPostsRawSqlRepository.changeBanStatusPostsLikesByUserId(
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

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InternalServerErrorException } from '@nestjs/common';
import { PostsRawSqlRepository } from '../../infrastructure/posts-raw-sql.repository';
import { LikeStatusPostsRawSqlRepository } from '../../infrastructure/like-status-posts-raw-sql.repository';

// Command class representing the action to change the ban status for a user's posts on a particular blog
export class ChangeBanStatusPostsByBlogIdCommand {
  constructor(public blogId: string, public isBanned: boolean) {}
}

// Command handler class that implements the ICommandHandler for ChangeBanStatusPostsByUserIdBlogIdCommand
@CommandHandler(ChangeBanStatusPostsByBlogIdCommand)
export class ChangeBanStatusPostsByBlogIdUseCase
  implements ICommandHandler<ChangeBanStatusPostsByBlogIdCommand>
{
  constructor(
    protected postsRawSqlRepository: PostsRawSqlRepository,
    protected likeStatusPostsRawSqlRepository: LikeStatusPostsRawSqlRepository,
  ) {}
  // Execute the command to change the ban status of a user's posts and likes on a specific blog
  async execute(
    command: ChangeBanStatusPostsByBlogIdCommand,
  ): Promise<boolean> {
    const { blogId, isBanned } = command;
    try {
      // Execute the changeBanStatusPostsByUserIdBlogId and changeBanStatusLikesPostsByUserIdBlogId methods in parallel
      await Promise.all([
        this.postsRawSqlRepository.changeBanStatusPostsByBlogId(
          blogId,
          isBanned,
        ),
        this.likeStatusPostsRawSqlRepository.changeBanStatusLikesPostsByBlogId(
          blogId,
          isBanned,
        ),
      ]);
      // Return true to indicate that the ban status change was successful
      return true;
    } catch (error) {
      // If an error occurs during the execution of repository methods, log the error and rethrow it as an InternalServerErrorException
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }
}

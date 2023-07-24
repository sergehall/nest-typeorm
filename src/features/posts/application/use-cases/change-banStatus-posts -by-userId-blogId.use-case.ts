import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRawSqlRepository } from '../../infrastructure/posts-raw-sql.repository';
import { BannedUsersForBlogsEntity } from '../../../blogger-blogs/entities/banned-users-for-blogs.entity';
import { InternalServerErrorException } from '@nestjs/common';
import { LikeStatusPostsRawSqlRepository } from '../../infrastructure/like-status-posts-raw-sql.repository';

// Command class representing the action to change the ban status for a user's posts on a particular blog
export class ChangeBanStatusPostsByUserIdBlogIdCommand {
  constructor(public bannedUserForBlogEntity: BannedUsersForBlogsEntity) {}
}

// Command handler class that implements the ICommandHandler for ChangeBanStatusPostsByUserIdBlogIdCommand
@CommandHandler(ChangeBanStatusPostsByUserIdBlogIdCommand)
export class ChangeBanStatusPostsByUserIdBlogIdUseCase
  implements ICommandHandler<ChangeBanStatusPostsByUserIdBlogIdCommand>
{
  constructor(
    protected postsRawSqlRepository: PostsRawSqlRepository,
    protected likeStatusPostsRawSqlRepository: LikeStatusPostsRawSqlRepository,
  ) {}
  // Execute the command to change the ban status of a user's posts and likes on a specific blog
  async execute(
    command: ChangeBanStatusPostsByUserIdBlogIdCommand,
  ): Promise<boolean> {
    const { bannedUserForBlogEntity } = command;
    try {
      // Execute the changeBanStatusPostsByUserIdBlogId and changeBanStatusLikesPostsByUserIdBlogId methods in parallel
      await Promise.all([
        // no needs
        // this.postsRawSqlRepository.changeBanStatusPostsByUserIdBlogId(
        //   bannedUserForBlogEntity,
        // ),
        this.likeStatusPostsRawSqlRepository.changeBanStatusLikesPostsByUserIdBlogId(
          bannedUserForBlogEntity,
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

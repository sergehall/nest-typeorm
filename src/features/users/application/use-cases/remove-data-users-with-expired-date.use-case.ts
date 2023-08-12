import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InternalServerErrorException } from '@nestjs/common';
import { UsersRawSqlRepository } from '../../infrastructure/users-raw-sql.repository';
import { LikeStatusPostsRawSqlRepository } from '../../../posts/infrastructure/like-status-posts-raw-sql.repository';
import { LikeStatusCommentsRawSqlRepository } from '../../../comments/infrastructure/like-status-comments-raw-sql.repository';
import { CommentsRawSqlRepository } from '../../../comments/infrastructure/comments-raw-sql.repository';
import { PostsRawSqlRepository } from '../../../posts/infrastructure/posts-raw-sql.repository';
import { SecurityDevicesRawSqlRepository } from '../../../security-devices/infrastructure/security-devices-raw-sql.repository';
import { BloggerBlogsRawSqlRepository } from '../../../blogger-blogs/infrastructure/blogger-blogs-raw-sql.repository';
import { BannedUsersForBlogsRawSqlRepository } from '../../infrastructure/banned-users-for-blogs-raw-sql.repository';
import { SentEmailsTimeConfirmAndRecoverCodesRepository } from '../../../mails/infrastructure/sent-email-confirmation-code-time.repository';
import { TablesUsersWithIdEntity } from '../../entities/tables-user-with-id.entity';

export class RemoveDataUsersWithExpiredDateCommand {}

@CommandHandler(RemoveDataUsersWithExpiredDateCommand)
export class RemoveDataUsersWithExpiredDateUseCase
  implements ICommandHandler<RemoveDataUsersWithExpiredDateCommand>
{
  constructor(
    private readonly usersRawSqlRepository: UsersRawSqlRepository,
    private readonly likeStatusPostRepository: LikeStatusPostsRawSqlRepository,
    private readonly likeStatusCommentsRepo: LikeStatusCommentsRawSqlRepository,
    private readonly commentsRepository: CommentsRawSqlRepository,
    private readonly postsRepository: PostsRawSqlRepository,
    private readonly securityDevicesRepository: SecurityDevicesRawSqlRepository,
    private readonly bloggerBlogsRepository: BloggerBlogsRawSqlRepository,
    private readonly bannedUsersForBlogsRepository: BannedUsersForBlogsRawSqlRepository,
    private readonly sentEmailsTimeConfCodeRepo: SentEmailsTimeConfirmAndRecoverCodesRepository,
  ) {}
  async execute(): Promise<void> {
    try {
      let countExpiredDate =
        await this.usersRawSqlRepository.totalCountOldestUsersWithExpirationDate();

      if (countExpiredDate > 0) {
        // Limiting the count of expired dates to a maximum value of 100,000
        countExpiredDate = Math.min(countExpiredDate, 100000);
      } else {
        return;
      }

      // Get the oldest users with expiration dates equal countExpiredDate and it will limit.
      const oldestUsers: TablesUsersWithIdEntity[] =
        await this.usersRawSqlRepository.getOldestUsersWithExpirationDate(
          countExpiredDate,
        );

      // Loop through each oldest user and remove their data
      for (let i = 0; i < oldestUsers.length; i++) {
        const userId = oldestUsers[i].id;
        await this.removeUserData(userId);
      }
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  // Remove related data for a single user
  private async removeUserData(userId: string): Promise<void> {
    // Remove related data for the user
    await Promise.all([
      this.securityDevicesRepository.removeDevicesByUseId(userId),
      this.bannedUsersForBlogsRepository.removeBannedUserByUserId(userId),
      this.sentEmailsTimeConfCodeRepo.removeSentEmailsTimeByUserId(userId),
      this.likeStatusCommentsRepo.removeLikesCommentsByUserIdAndCommentOwnerId(
        userId,
      ),
      this.likeStatusPostRepository.removeLikesPostsByUserIdAndPostOwnerId(
        userId,
      ),
    ]);
    await this.commentsRepository.removeCommentsByUserId(userId);
    await this.postsRepository.removePostsByUserId(userId);
    await this.bloggerBlogsRepository.removeBlogsByUserId(userId);
    await this.usersRawSqlRepository.removeUserByUserId(userId);
  }
}

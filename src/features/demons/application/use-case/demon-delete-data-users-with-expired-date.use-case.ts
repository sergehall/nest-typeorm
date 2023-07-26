import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InternalServerErrorException } from '@nestjs/common';
import { UsersRawSqlRepository } from '../../../users/infrastructure/users-raw-sql.repository';
import { TablesUsersEntityWithId } from '../../../users/entities/userRawSqlWithId.entity';
import { LikeStatusPostsRawSqlRepository } from '../../../posts/infrastructure/like-status-posts-raw-sql.repository';
import { LikeStatusCommentsRawSqlRepository } from '../../../comments/infrastructure/like-status-comments-raw-sql.repository';
import { CommentsRawSqlRepository } from '../../../comments/infrastructure/comments-raw-sql.repository';
import { PostsRawSqlRepository } from '../../../posts/infrastructure/posts-raw-sql.repository';
import { SecurityDevicesRawSqlRepository } from '../../../security-devices/infrastructure/security-devices-raw-sql.repository';
import { BloggerBlogsRawSqlRepository } from '../../../blogger-blogs/infrastructure/blogger-blogs-raw-sql.repository';
import { BannedUsersForBlogsRawSqlRepository } from '../../../users/infrastructure/banned-users-for-blogs-raw-sql.repository';
import { SentEmailsTimeConfirmAndRecoverCodesRepository } from '../../../mails/infrastructure/sentEmailEmailsConfirmationCodeTime.repository';

export class DemonRemoveDataUsersWithExpiredDateCommand {}

@CommandHandler(DemonRemoveDataUsersWithExpiredDateCommand)
export class DemonRemoveDataUsersWithExpiredDateUseCase
  implements ICommandHandler<DemonRemoveDataUsersWithExpiredDateCommand>
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
  async execute() {
    try {
      const oldestUser: TablesUsersEntityWithId[] =
        await this.usersRawSqlRepository.getOldestUserWithExpirationDate();
      if (oldestUser.length === 0) return true;

      const { id } = oldestUser[0];

      await Promise.all([
        this.sentEmailsTimeConfCodeRepo.removeSentEmailsTimeByUserId(id),
        this.likeStatusCommentsRepo.removeLikesUserCommentByUserId(id),
        this.likeStatusPostRepository.removeLikesPostUserByUserId(id),
        this.commentsRepository.removeCommentsByUserId(id),
        this.postsRepository.removePostsByUserId(id),
        this.bloggerBlogsRepository.removeBlogsByUserId(id),
        this.securityDevicesRepository.removeDevicesByUseId(id),
        this.bannedUsersForBlogsRepository.removeBannedUserByUserId(id),
        this.usersRawSqlRepository.removeUserByUserId(id),
      ]);
      return true;
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }
}

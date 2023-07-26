import { ICommandHandler } from '@nestjs/cqrs';
import { UsersRawSqlRepository } from '../../../users/infrastructure/users-raw-sql.repository';
import { LikeStatusPostsRawSqlRepository } from '../../../posts/infrastructure/like-status-posts-raw-sql.repository';
import { LikeStatusCommentsRawSqlRepository } from '../../../comments/infrastructure/like-status-comments-raw-sql.repository';
import { CommentsRawSqlRepository } from '../../../comments/infrastructure/comments-raw-sql.repository';
import { PostsRawSqlRepository } from '../../../posts/infrastructure/posts-raw-sql.repository';
import { SecurityDevicesRawSqlRepository } from '../../../security-devices/infrastructure/security-devices-raw-sql.repository';
import { BloggerBlogsRawSqlRepository } from '../../../blogger-blogs/infrastructure/blogger-blogs-raw-sql.repository';
import { BannedUsersForBlogsRawSqlRepository } from '../../../users/infrastructure/banned-users-for-blogs-raw-sql.repository';
import { SentEmailsTimeConfirmAndRecoverCodesRepository } from '../../../mails/infrastructure/sentEmailEmailsConfirmationCodeTime.repository';
import { InternalServerErrorException } from '@nestjs/common';

export class SaDeleteUserByUserIdCommand {
  constructor(public userId: string) {}
}
export class SaDeleteUserByUserIdUseCase
  implements ICommandHandler<SaDeleteUserByUserIdCommand>
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
  async execute(command: SaDeleteUserByUserIdCommand): Promise<any> {
    const { userId } = command;
    try {
      await Promise.all([
        this.sentEmailsTimeConfCodeRepo.removeSentEmailsTimeByUserId(userId),
        this.likeStatusCommentsRepo.removeLikesUserCommentByUserId(userId),
        this.likeStatusPostRepository.removeLikesPostUserByUserId(userId),
        this.commentsRepository.removeCommentsByUserId(userId),
        this.postsRepository.removePostsByUserId(userId),
        this.bloggerBlogsRepository.removeBlogsByUserId(userId),
        this.securityDevicesRepository.removeDevicesByUseId(userId),
        this.bannedUsersForBlogsRepository.removeBannedUserByUserId(userId),
        this.usersRawSqlRepository.removeUserByUserId(userId),
      ]);
      return true;
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }
}

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRawSqlRepository } from '../../../users/infrastructure/users-raw-sql.repository';
import { LikeStatusPostsRawSqlRepository } from '../../../posts/infrastructure/like-status-posts-raw-sql.repository';
import { LikeStatusCommentsRawSqlRepository } from '../../../comments/infrastructure/like-status-comments-raw-sql.repository';
import { CommentsRawSqlRepository } from '../../../comments/infrastructure/comments-raw-sql.repository';
import { PostsRawSqlRepository } from '../../../posts/infrastructure/posts-raw-sql.repository';
import { SecurityDevicesRawSqlRepository } from '../../../security-devices/infrastructure/security-devices-raw-sql.repository';
import { BloggerBlogsRawSqlRepository } from '../../../blogger-blogs/infrastructure/blogger-blogs-raw-sql.repository';
import { BannedUsersForBlogsRawSqlRepository } from '../../../users/infrastructure/banned-users-for-blogs-raw-sql.repository';
import { SentEmailsTimeConfirmAndRecoverCodesRepository } from '../../../mails/infrastructure/sentEmailEmailsConfirmationCodeTime.repository';
import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../../ability/roles/action.enum';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';

export class SaRemoveUserByUserIdCommand {
  constructor(public userId: string, public currentUserDto: CurrentUserDto) {}
}
@CommandHandler(SaRemoveUserByUserIdCommand)
export class SaRemoveUserByUserIdUseCase
  implements ICommandHandler<SaRemoveUserByUserIdCommand>
{
  constructor(
    private readonly caslAbilityFactory: CaslAbilityFactory,
    private readonly usersRawSqlRepository: UsersRawSqlRepository,
    private readonly likeStatusCommentsRepo: LikeStatusCommentsRawSqlRepository,
    private readonly likeStatusPostsRepository: LikeStatusPostsRawSqlRepository,
    private readonly commentsRepository: CommentsRawSqlRepository,
    private readonly postsRepository: PostsRawSqlRepository,
    private readonly securityDevicesRepository: SecurityDevicesRawSqlRepository,
    private readonly bloggerBlogsRepository: BloggerBlogsRawSqlRepository,
    private readonly bannedUsersForBlogsRepository: BannedUsersForBlogsRawSqlRepository,
    private readonly sentEmailsTimeRepo: SentEmailsTimeConfirmAndRecoverCodesRepository,
  ) {}
  async execute(command: SaRemoveUserByUserIdCommand): Promise<boolean> {
    const { userId, currentUserDto } = command;

    const userToRemove = await this.usersRawSqlRepository.saFindUserByUserId(
      userId,
    );
    if (!userToRemove) throw new NotFoundException('Not found user.');

    this.checkUserPermission(currentUserDto, userToRemove.id);

    await this.executeRemoveUserStatusCommands(userId);

    return true;
  }

  private async executeRemoveUserStatusCommands(
    userId: string,
  ): Promise<boolean> {
    try {
      // Remove related data for the user
      await Promise.all([
        this.sentEmailsTimeRepo.removeSentEmailsTimeByUserId(userId),
        this.bannedUsersForBlogsRepository.removeBannedUserByUserId(userId),
        this.securityDevicesRepository.removeDevicesByUseId(userId),
        this.likeStatusCommentsRepo.removeLikesCommentsByUserIdAndCommentOwnerId(
          userId,
        ),
        this.likeStatusPostsRepository.removeLikesPostsByUserIdAndPostOwnerId(
          userId,
        ),
      ]);
      await this.commentsRepository.removeCommentsByUserId(userId);
      await this.postsRepository.removePostsByUserId(userId);
      await this.bloggerBlogsRepository.removeBlogsByUserId(userId);
      await this.usersRawSqlRepository.removeUserByUserId(userId);
      return true;
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  private checkUserPermission(currentUserDto: CurrentUserDto, userId: string) {
    const ability = this.caslAbilityFactory.createSaUser(currentUserDto);
    try {
      ForbiddenError.from(ability).throwUnlessCan(Action.UPDATE, {
        id: userId,
      });
    } catch (error) {
      throw new ForbiddenException(
        'You are not allowed to remove user. ' + error.message,
      );
    }
  }
}

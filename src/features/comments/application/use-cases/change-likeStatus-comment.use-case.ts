import { LikeStatusDto } from '../../dto/like-status.dto';
import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { BannedUsersForBlogsRawSqlRepository } from '../../../users/infrastructure/banned-users-for-blogs-raw-sql.repository';
import { userNotHavePermissionForBlog } from '../../../../common/filters/custom-errors-messages';
import { CommentsEntity } from '../../entities/comments.entity';
import { LikeStatusCommentsRepo } from '../../infrastructure/like-status-comments.repo';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import { CommentsRepo } from '../../infrastructure/comments.repo';
import { LikeStatusCommentsEntity } from '../../entities/like-status-comments.entity';

export class ChangeLikeStatusCommentCommand {
  constructor(
    public commentId: string,
    public likeStatusDto: LikeStatusDto,
    public currentUserDto: CurrentUserDto,
  ) {}
}

@CommandHandler(ChangeLikeStatusCommentCommand)
export class ChangeLikeStatusCommentUseCase
  implements ICommandHandler<ChangeLikeStatusCommentCommand>
{
  constructor(
    protected caslAbilityFactory: CaslAbilityFactory,
    protected commentsRepo: CommentsRepo,
    protected bannedUsersForBlogsRawSqlRepository: BannedUsersForBlogsRawSqlRepository,
    protected likeStatusCommentsRepo: LikeStatusCommentsRepo,
  ) {}
  async execute(
    command: ChangeLikeStatusCommentCommand,
  ): Promise<LikeStatusCommentsEntity> {
    const { commentId, likeStatusDto, currentUserDto } = command;

    const findComment: CommentsEntity | null =
      await this.commentsRepo.findCommentByIdWithoutLikes(commentId);

    if (!findComment)
      throw new NotFoundException(`Comment with ID ${commentId} not found`);

    await this.checkUserPermission(currentUserDto.userId, findComment.blog.id);

    try {
      return await this.likeStatusCommentsRepo.updateLikeStatusComment(
        likeStatusDto,
        currentUserDto,
        findComment,
      );
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  private async checkUserPermission(userId: string, postInfoBlogId: string) {
    const userIsBannedForBlog =
      await this.bannedUsersForBlogsRawSqlRepository.userIsBanned(
        userId,
        postInfoBlogId,
      );
    if (userIsBannedForBlog)
      throw new ForbiddenException(userNotHavePermissionForBlog);
  }
}

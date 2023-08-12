import { LikeStatusDto } from '../../dto/like-status.dto';
import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { TablesLikeStatusCommentsEntity } from '../../entities/tables-like-status-comments.entity';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { CommentsRawSqlRepository } from '../../infrastructure/comments-raw-sql.repository';
import { LikeStatusCommentsRawSqlRepository } from '../../infrastructure/like-status-comments-raw-sql.repository';
import { BannedUsersForBlogsRawSqlRepository } from '../../../users/infrastructure/banned-users-for-blogs-raw-sql.repository';
import { userNotHavePermissionForBlog } from '../../../../common/filters/custom-errors-messages';

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
    protected commentsRawSqlRepository: CommentsRawSqlRepository,
    protected likeStatusCommentsRawSqlRepository: LikeStatusCommentsRawSqlRepository,
    protected bannedUsersForBlogsRawSqlRepository: BannedUsersForBlogsRawSqlRepository,
  ) {}
  async execute(command: ChangeLikeStatusCommentCommand): Promise<boolean> {
    const { commentId, likeStatusDto, currentUserDto } = command;
    const findComment =
      await this.commentsRawSqlRepository.findCommentByCommentId(
        command.commentId,
      );
    if (!findComment) throw new NotFoundException('Not found comment.');

    const userIsBannedForBlog =
      await this.bannedUsersForBlogsRawSqlRepository.userIsBanned(
        currentUserDto.id,
        findComment.postInfoBlogId,
      );

    if (userIsBannedForBlog)
      throw new ForbiddenException(userNotHavePermissionForBlog);

    const likeStatusCommEntity: TablesLikeStatusCommentsEntity = {
      commentId: commentId,
      blogId: findComment.postInfoBlogId,
      commentOwnerId: findComment.commentatorInfoUserId,
      userId: currentUserDto.id,
      isBanned: currentUserDto.isBanned,
      likeStatus: likeStatusDto.likeStatus,
      createdAt: new Date().toISOString(),
    };

    try {
      return await this.likeStatusCommentsRawSqlRepository.updateLikeStatusComment(
        likeStatusCommEntity,
      );
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }
}

import { LikeStatusDto } from '../../dto/like-status.dto';
import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { CommentsRawSqlRepository } from '../../infrastructure/comments-raw-sql.repository';
import { LikeStatusCommentsRawSqlRepository } from '../../infrastructure/like-status-comments-raw-sql.repository';
import { BannedUsersForBlogsRawSqlRepository } from '../../../users/infrastructure/banned-users-for-blogs-raw-sql.repository';
import { userNotHavePermissionForBlog } from '../../../../common/filters/custom-errors-messages';
import { BloggerBlogsEntity } from '../../../blogger-blogs/entities/blogger-blogs.entity';
import { UsersEntity } from '../../../users/entities/users.entity';
import { CommentsEntity } from '../../entities/comments.entity';
import { LikeStatusCommentsRepo } from '../../infrastructure/like-status-comments.repo';

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
    protected likeStatusCommentsRepo: LikeStatusCommentsRepo,
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
        currentUserDto.userId,
        findComment.postInfoBlogId,
      );

    if (userIsBannedForBlog)
      throw new ForbiddenException(userNotHavePermissionForBlog);

    const commentatorUserEntity = new UsersEntity();
    commentatorUserEntity.userId = findComment.commentatorInfoUserId;

    const blogEntity = new BloggerBlogsEntity();
    blogEntity.id = findComment.postInfoBlogId;

    const findCommentEntity = new CommentsEntity();
    findCommentEntity.id = commentId;
    findCommentEntity.commentator = commentatorUserEntity;
    findCommentEntity.blog = blogEntity;

    try {
      const result = await this.likeStatusCommentsRepo.updateLikeStatusComment(
        likeStatusDto,
        currentUserDto,
        findCommentEntity,
      );
      return result !== null;
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }
}

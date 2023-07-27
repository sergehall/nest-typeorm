import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../../ability/roles/action.enum';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BloggerBlogsService } from '../blogger-blogs.service';
import { IdDto } from '../../../../ability/dto/id.dto';
import { LikeStatusCommentsRawSqlRepository } from '../../../comments/infrastructure/like-status-comments-raw-sql.repository';
import { LikeStatusPostsRawSqlRepository } from '../../../posts/infrastructure/like-status-posts-raw-sql.repository';
import { CommentsRawSqlRepository } from '../../../comments/infrastructure/comments-raw-sql.repository';
import { PostsRawSqlRepository } from '../../../posts/infrastructure/posts-raw-sql.repository';
import { BloggerBlogsRawSqlRepository } from '../../infrastructure/blogger-blogs-raw-sql.repository';
import { BannedUsersForBlogsRawSqlRepository } from '../../../users/infrastructure/banned-users-for-blogs-raw-sql.repository';

export class RemoveBlogByIdCommand {
  constructor(public id: string, public currentUserDto: CurrentUserDto) {}
}

@CommandHandler(RemoveBlogByIdCommand)
export class RemoveBlogByIdUseCase
  implements ICommandHandler<RemoveBlogByIdCommand>
{
  constructor(
    private readonly caslAbilityFactory: CaslAbilityFactory,
    private readonly bloggerBlogsService: BloggerBlogsService,
    private readonly likeStatusCommentsRepo: LikeStatusCommentsRawSqlRepository,
    private readonly likeStatusPostRepository: LikeStatusPostsRawSqlRepository,
    private readonly commentsRepository: CommentsRawSqlRepository,
    private readonly postsRepository: PostsRawSqlRepository,
    private readonly bannedUsersForBlogsRepository: BannedUsersForBlogsRawSqlRepository,
    private readonly bloggerBlogsRepository: BloggerBlogsRawSqlRepository,
  ) {}
  async execute(command: RemoveBlogByIdCommand): Promise<boolean> {
    const { id, currentUserDto } = command;

    const blogToRemove = await this.bloggerBlogsService.findBlogById(id);
    if (!blogToRemove) throw new NotFoundException('Not found blog.');

    this.checkUserPermission(currentUserDto, blogToRemove.blogOwnerId);

    await this.executeRemoveBlogByBlogIdCommands(id);
    return true;
  }

  private async executeRemoveBlogByBlogIdCommands(
    blogId: string,
  ): Promise<boolean> {
    try {
      await this.likeStatusCommentsRepo.removeLikesCommentsByBlogId(blogId);
      await this.likeStatusPostRepository.removeLikesPostsByBlogId(blogId);
      await this.commentsRepository.removeCommentsByBlogId(blogId);
      await this.postsRepository.removePostsByBlogId(blogId);
      await this.bannedUsersForBlogsRepository.removeBannedUserByBlogId(blogId);
      await this.bloggerBlogsRepository.removeBlogsByBlogId(blogId);
      return true;
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  private checkUserPermission(
    currentUserDto: CurrentUserDto,
    blogOwnerId: string,
  ) {
    const userIdDto: IdDto = { id: currentUserDto.id };
    const ability = this.caslAbilityFactory.createForUserId(userIdDto);
    try {
      ForbiddenError.from(ability).throwUnlessCan(Action.UPDATE, {
        id: blogOwnerId,
      });
    } catch (error) {
      throw new ForbiddenException(
        'You are not allowed to remove this blog. ' + error.message,
      );
    }
  }
}

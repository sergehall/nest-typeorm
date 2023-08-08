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
import { BlogIdPostIdParams } from '../../../common/query/params/blogId-postId.params';
import { TableBloggerBlogsRawSqlEntity } from '../../../blogger-blogs/entities/table-blogger-blogs-raw-sql.entity';
import { BloggerBlogsRawSqlRepository } from '../../../blogger-blogs/infrastructure/blogger-blogs-raw-sql.repository';
import { PostsRawSqlRepository } from '../../infrastructure/posts-raw-sql.repository';
import { LikeStatusCommentsRawSqlRepository } from '../../../comments/infrastructure/like-status-comments-raw-sql.repository';
import { LikeStatusPostsRawSqlRepository } from '../../infrastructure/like-status-posts-raw-sql.repository';
import { CommentsRawSqlRepository } from '../../../comments/infrastructure/comments-raw-sql.repository';
import { TablesPostsEntity } from '../../entities/tables-posts-entity';

export class RemovePostByPostIdCommand {
  constructor(
    public params: BlogIdPostIdParams,
    public currentUserDto: CurrentUserDto,
  ) {}
}

@CommandHandler(RemovePostByPostIdCommand)
export class RemovePostByPostIdUseCase
  implements ICommandHandler<RemovePostByPostIdCommand>
{
  constructor(
    private readonly caslAbilityFactory: CaslAbilityFactory,
    private readonly bloggerBlogsRawSqlRepository: BloggerBlogsRawSqlRepository,
    private readonly likeStatusCommentsRepo: LikeStatusCommentsRawSqlRepository,
    private readonly likeStatusPostRepository: LikeStatusPostsRawSqlRepository,
    private readonly commentsRepository: CommentsRawSqlRepository,
    private readonly postsRepository: PostsRawSqlRepository,
  ) {}
  async execute(command: RemovePostByPostIdCommand): Promise<boolean> {
    const { params, currentUserDto } = command;

    const blog: TableBloggerBlogsRawSqlEntity | null =
      await this.bloggerBlogsRawSqlRepository.findBlogById(params.blogId);
    if (!blog) throw new NotFoundException('Not found blog.');

    const postToRemove: TablesPostsEntity | null =
      await this.postsRepository.getPostById(params.postId);
    if (!postToRemove) throw new NotFoundException('Not found post.');

    await this.checkUserPermission(postToRemove.postOwnerId, currentUserDto);

    await this.executeRemovePostByPostIdCommands(postToRemove.id);

    return true;
  }

  private async checkUserPermission(
    postOwnerId: string,
    currentUserDto: CurrentUserDto,
  ) {
    const ability = this.caslAbilityFactory.createForUserId({
      id: postOwnerId,
    });
    try {
      ForbiddenError.from(ability).throwUnlessCan(Action.UPDATE, {
        id: currentUserDto.id,
      });
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(
          'You do not have permission to delete a post. ' + error.message,
        );
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  private async executeRemovePostByPostIdCommands(
    postId: string,
  ): Promise<boolean> {
    try {
      await this.likeStatusPostRepository.removeLikesPostByPostId(postId);
      await this.commentsRepository.removeCommentsByPostId(postId);
      return await this.postsRepository.removePostByPostId(postId);
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }
}

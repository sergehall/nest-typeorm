import { CurrentUserDto } from '../../../users/dto/current-user.dto';
import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../../ability/roles/action.enum';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogIdPostIdParams } from '../../../../common/query/params/blogId-postId.params';
import { PostsRepo } from '../../infrastructure/posts-repo';
import { BloggerBlogsRepo } from '../../../blogger-blogs/infrastructure/blogger-blogs.repo';
import { BloggerBlogsEntity } from '../../../blogger-blogs/entities/blogger-blogs.entity';
import { PostsEntity } from '../../entities/posts.entity';

export class DeletePostByPostIdAndBlogIdCommand {
  constructor(
    public params: BlogIdPostIdParams,
    public currentUserDto: CurrentUserDto,
  ) {}
}

@CommandHandler(DeletePostByPostIdAndBlogIdCommand)
export class DeletePostByPostIdAndBlogIdUseCase
  implements ICommandHandler<DeletePostByPostIdAndBlogIdCommand>
{
  constructor(
    private readonly caslAbilityFactory: CaslAbilityFactory,
    private readonly bloggerBlogsRepo: BloggerBlogsRepo,
    private readonly postsRepo: PostsRepo,
  ) {}
  async execute(command: DeletePostByPostIdAndBlogIdCommand): Promise<boolean> {
    const { params, currentUserDto } = command;
    const { blogId, postId } = params;

    const blog: BloggerBlogsEntity | null =
      await this.bloggerBlogsRepo.findBlogById(blogId);
    if (!blog) throw new NotFoundException(`Blog with id: ${blogId} not found`);

    const postToRemove: PostsEntity | null =
      await this.postsRepo.getPostByIdWithoutLikes(postId);
    if (!postToRemove)
      throw new NotFoundException(`Post with id: ${postId} not found`);

    await this.checkUserPermission(
      postToRemove.postOwner.userId,
      currentUserDto,
    );

    return await this.postsRepo.deletePostByPostId(postToRemove.id);
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
        id: currentUserDto.userId,
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
}

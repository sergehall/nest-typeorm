import { CurrentUserDto } from '../../../users/dto/current-user.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../../ability/roles/action.enum';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BloggerBlogsEntity } from '../../../blogger-blogs/entities/blogger-blogs.entity';
import { PostsEntity } from '../../../posts/entities/posts.entity';
import { PostsRepo } from '../../../posts/infrastructure/posts-repo';
import { BloggerBlogsRepo } from '../../../blogger-blogs/infrastructure/blogger-blogs.repo';
import { BlogIdPostIdParams } from '../../../../common/query/params/blogId-postId.params';

export class SaDeletePostByPostIdCommand {
  constructor(
    public params: BlogIdPostIdParams,
    public currentUserDto: CurrentUserDto,
  ) {}
}

@CommandHandler(SaDeletePostByPostIdCommand)
export class SaDeletePostByPostIdUseCase
  implements ICommandHandler<SaDeletePostByPostIdCommand>
{
  constructor(
    private readonly caslAbilityFactory: CaslAbilityFactory,
    private readonly postsRepo: PostsRepo,
    private readonly bloggerBlogsRepo: BloggerBlogsRepo,
  ) {}
  async execute(command: SaDeletePostByPostIdCommand): Promise<boolean> {
    const { params, currentUserDto } = command;
    const { blogId, postId } = params;

    const blog: BloggerBlogsEntity | null =
      await this.bloggerBlogsRepo.findBlogById(blogId);
    if (!blog) throw new NotFoundException(`Blog with ID ${blogId} not found`);

    const post: PostsEntity | null =
      await this.postsRepo.getPostByIdWithoutLikes(postId);
    if (!post) throw new NotFoundException(`Post with ID ${postId} not found`);

    await this.checkSaPermission(currentUserDto);

    return await this.postsRepo.deletePostByPostId(postId);
  }

  private async checkSaPermission(currentUser: CurrentUserDto): Promise<void> {
    const ability = this.caslAbilityFactory.createSaUser(currentUser);

    try {
      ForbiddenError.from(ability).throwUnlessCan(Action.UPDATE, {
        id: currentUser.userId,
      });
    } catch (error) {
      throw new ForbiddenException(
        'You are not allowed to delete this post. ' + error.message,
      );
    }
  }
}

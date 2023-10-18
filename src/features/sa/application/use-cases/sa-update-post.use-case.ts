import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../../ability/roles/action.enum';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../../users/dto/current-user.dto';
import { UpdatePostDto } from '../../../posts/dto/update-post.dto';
import { PostsRepo } from '../../../posts/infrastructure/posts-repo';
import { BlogIdPostIdParams } from '../../../../common/query/params/blogId-postId.params';
import { BloggerBlogsEntity } from '../../../blogger-blogs/entities/blogger-blogs.entity';
import { PostsEntity } from '../../../posts/entities/posts.entity';
import { BloggerBlogsRepo } from '../../../blogger-blogs/infrastructure/blogger-blogs.repo';

export class SaUpdatePostsByPostIdCommand {
  constructor(
    public params: BlogIdPostIdParams,
    public updatePostDto: UpdatePostDto,
    public currentUserDto: CurrentUserDto,
  ) {}
}

@CommandHandler(SaUpdatePostsByPostIdCommand)
export class SaUpdatePostsByPostIdUseCase
  implements ICommandHandler<SaUpdatePostsByPostIdCommand>
{
  constructor(
    private readonly postsRepo: PostsRepo,
    private readonly bloggerBlogsRepo: BloggerBlogsRepo,
    private readonly caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async execute(command: SaUpdatePostsByPostIdCommand): Promise<boolean> {
    const { params, updatePostDto, currentUserDto } = command;
    const { blogId, postId } = params;

    const blog: BloggerBlogsEntity | null =
      await this.bloggerBlogsRepo.findBlogById(blogId);
    if (!blog) throw new NotFoundException(`Blog with ID ${blogId} not found`);

    const post: PostsEntity | null =
      await this.postsRepo.getPostByIdWithoutLikes(postId);
    if (!post) throw new NotFoundException(`Post with ID ${postId} not found`);

    await this.checkSaPermission(currentUserDto);

    return await this.postsRepo.updatePostByPostId(postId, updatePostDto);
  }

  private async checkSaPermission(currentUser: CurrentUserDto): Promise<void> {
    const ability = this.caslAbilityFactory.createSaUser(currentUser);

    try {
      ForbiddenError.from(ability).throwUnlessCan(Action.UPDATE, {
        id: currentUser.userId,
      });
    } catch (error) {
      throw new ForbiddenException(
        'You are not allowed to update this post. ' + error.message,
      );
    }
  }
}

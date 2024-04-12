import { BlogIdPostIdParams } from '../../../../common/query/params/blogId-postId.params';
import { UpdatePostDto } from '../../dto/update-post.dto';
import { CurrentUserDto } from '../../../users/dto/current-user.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../../ability/roles/action.enum';
import { BloggerBlogsRepo } from '../../../blogger-blogs/infrastructure/blogger-blogs.repo';
import { BloggerBlogsEntity } from '../../../blogger-blogs/entities/blogger-blogs.entity';
import { PostsRepo } from '../../infrastructure/posts-repo';
import { PostsEntity } from '../../entities/posts.entity';

export class UpdatePostByPostIdCommand {
  constructor(
    public params: BlogIdPostIdParams,
    public updatePostDto: UpdatePostDto,
    public currentUserDto: CurrentUserDto,
  ) {}
}

@CommandHandler(UpdatePostByPostIdCommand)
export class UpdatePostByPostIdUseCase
  implements ICommandHandler<UpdatePostByPostIdCommand>
{
  constructor(
    protected caslAbilityFactory: CaslAbilityFactory,
    protected postsRepo: PostsRepo,
    protected bloggerBlogsRepo: BloggerBlogsRepo,
  ) {}

  async execute(command: UpdatePostByPostIdCommand): Promise<boolean> {
    const { params, updatePostDto, currentUserDto } = command;
    const { blogId, postId } = params;

    const blog: BloggerBlogsEntity | null =
      await this.bloggerBlogsRepo.findNotBannedBlogById(blogId);

    if (!blog) {
      throw new NotFoundException(`Blog with ID ${blogId} not found`);
    }

    const post: PostsEntity | null =
      await this.postsRepo.getPostByIdWithoutLikes(postId);

    if (!post) {
      throw new NotFoundException(`Blog with ID ${postId} not found`);
    }

    await this.checkUserPermission(blog.blogOwner.userId, currentUserDto);

    return await this.postsRepo.updatePostByPostId(postId, updatePostDto);
  }

  private async checkUserPermission(
    blogOwnerId: string,
    currentUserDto: CurrentUserDto,
  ) {
    const ability = this.caslAbilityFactory.createForUserId({
      id: blogOwnerId,
    });
    try {
      ForbiddenError.from(ability).throwUnlessCan(Action.UPDATE, {
        id: currentUserDto.userId,
      });
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(
          'You do not have permission to update a post. ' + error.message,
        );
      }
      throw new InternalServerErrorException(error.message);
    }
  }
}

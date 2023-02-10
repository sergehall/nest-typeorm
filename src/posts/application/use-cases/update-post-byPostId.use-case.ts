import { UpdatePostBloggerBlogsDto } from '../../../blogger-blogs/dto/update-post-blogger-blogs.dto';
import { CurrentUserDto } from '../../../auth/dto/currentUser.dto';
import { BloggerBlogsEntity } from '../../../blogger-blogs/entities/blogger-blogs.entity';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../ability/roles/action.enum';
import { BloggerBlogsRepository } from '../../../blogger-blogs/infrastructure/blogger-blogs.repository';
import { CaslAbilityFactory } from '../../../ability/casl-ability.factory';
import { PostsService } from '../posts.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class UpdatePostByPostIdCommand {
  constructor(
    public blogId: string,
    public postId: string,
    public updatePostBBlogDto: UpdatePostBloggerBlogsDto,
    public currentUser: CurrentUserDto,
  ) {}
}

@CommandHandler(UpdatePostByPostIdCommand)
export class UpdatePostByPostIdUseCase
  implements ICommandHandler<UpdatePostByPostIdCommand>
{
  constructor(
    protected bloggerBlogsRepository: BloggerBlogsRepository,
    protected caslAbilityFactory: CaslAbilityFactory,
    protected postsService: PostsService,
  ) {}
  async execute(command: UpdatePostByPostIdCommand) {
    const blog: BloggerBlogsEntity | null =
      await this.bloggerBlogsRepository.findBlogById(command.blogId);
    if (!blog) throw new NotFoundException();

    const ability = this.caslAbilityFactory.createForBBlogger({
      id: blog.blogOwnerInfo.userId,
    });
    try {
      ForbiddenError.from(ability).throwUnlessCan(Action.DELETE, {
        id: command.currentUser.id,
      });
      const updatePostDto = {
        ...command.updatePostBBlogDto,
        blogId: command.blogId,
      };
      return await this.postsService.updatePost(command.postId, updatePostDto);
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      }
      if (error instanceof NotFoundException) {
        throw new NotFoundException();
      }
    }
  }
}

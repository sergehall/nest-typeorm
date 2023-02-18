import { BloggerBlogsEntity } from '../../../blogger-blogs/entities/blogger-blogs.entity';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../../ability/roles/action.enum';
import { BloggerBlogsRepository } from '../../../blogger-blogs/infrastructure/blogger-blogs.repository';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { BlogIdPostIdParams } from '../../../common/params/blogId-postId.params';
import { UpdateDataPostDto } from '../../dto/update-data-post.dto';

export class UpdatePostCommand {
  constructor(
    public updateDataPostDto: UpdateDataPostDto,
    public params: BlogIdPostIdParams,
    public currentUserDto: CurrentUserDto,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(
    protected bloggerBlogsRepository: BloggerBlogsRepository,
    protected caslAbilityFactory: CaslAbilityFactory,
    protected postsRepository: PostsRepository,
  ) {}
  async execute(command: UpdatePostCommand) {
    const blog: BloggerBlogsEntity | null =
      await this.bloggerBlogsRepository.findBlogById(command.params.blogId);
    if (!blog) throw new NotFoundException();
    const post = await this.postsRepository.findPostById(command.params.postId);
    if (!post) throw new NotFoundException();
    const ability = this.caslAbilityFactory.createForUserId({
      id: blog.blogOwnerInfo.userId,
    });
    try {
      ForbiddenError.from(ability).throwUnlessCan(Action.UPDATE, {
        id: command.currentUserDto.id,
      });
      return await this.postsRepository.updatePost(
        command.params.postId,
        command.updateDataPostDto,
      );
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

import { CurrentUserDto } from '../../../auth/dto/currentUser.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../../ability/roles/action.enum';
import { BloggerBlogsRepository } from '../../../blogger-blogs/infrastructure/blogger-blogs.repository';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infrastructure/posts.repository';

export class RemovePostByPostIdCommand {
  constructor(
    public blogId: string,
    public postId: string,
    public currentUser: CurrentUserDto,
  ) {}
}

@CommandHandler(RemovePostByPostIdCommand)
export class RemovePostByPostIdUseCase
  implements ICommandHandler<RemovePostByPostIdCommand>
{
  constructor(
    protected bloggerBlogsRepository: BloggerBlogsRepository,
    protected caslAbilityFactory: CaslAbilityFactory,
    protected postsRepository: PostsRepository,
  ) {}
  async execute(
    command: RemovePostByPostIdCommand,
  ): Promise<boolean | undefined> {
    const blogToDelete = await this.bloggerBlogsRepository.findBlogById(
      command.blogId,
    );
    if (!blogToDelete) throw new NotFoundException();
    const ability = this.caslAbilityFactory.createForBBlogger({
      id: blogToDelete.blogOwnerInfo.userId,
    });
    try {
      ForbiddenError.from(ability).throwUnlessCan(Action.DELETE, {
        id: command.currentUser.id,
      });

      return await this.postsRepository.removePost(command.postId);
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

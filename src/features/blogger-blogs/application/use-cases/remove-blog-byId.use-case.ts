import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../../ability/roles/action.enum';
import { BloggerBlogsRepository } from '../../infrastructure/blogger-blogs.repository';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class RemoveBlogByIdCommand {
  constructor(public id: string, public currentUser: CurrentUserDto) {}
}

@CommandHandler(RemoveBlogByIdCommand)
export class RemoveBlogByIdUseCase
  implements ICommandHandler<RemoveBlogByIdCommand>
{
  constructor(
    protected bloggerBlogsRepository: BloggerBlogsRepository,
    protected caslAbilityFactory: CaslAbilityFactory,
  ) {}
  async execute(command: RemoveBlogByIdCommand) {
    const blogToDelete = await this.bloggerBlogsRepository.findBlogById(
      command.id,
    );
    if (!blogToDelete) throw new NotFoundException();
    const ability = this.caslAbilityFactory.createForBBlogs({
      id: blogToDelete.blogOwnerInfo.userId,
    });
    try {
      ForbiddenError.from(ability).throwUnlessCan(Action.DELETE, {
        id: command.currentUser.id,
      });
      return await this.bloggerBlogsRepository.removeBlogById(command.id);
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      }
    }
  }
}

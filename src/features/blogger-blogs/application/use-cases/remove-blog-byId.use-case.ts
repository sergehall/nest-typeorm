import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../../ability/roles/action.enum';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BloggerBlogsService } from '../blogger-blogs.service';

export class RemoveBlogByIdCommand {
  constructor(public id: string, public currentUser: CurrentUserDto) {}
}

@CommandHandler(RemoveBlogByIdCommand)
export class RemoveBlogByIdUseCase
  implements ICommandHandler<RemoveBlogByIdCommand>
{
  constructor(
    protected bloggerBlogsService: BloggerBlogsService,
    protected caslAbilityFactory: CaslAbilityFactory,
  ) {}
  async execute(command: RemoveBlogByIdCommand) {
    console.log(command.currentUser, command.id, 'command.currentUser');
    const blogToDelete = await this.bloggerBlogsService.findBlogById(
      command.id,
    );
    console.log(blogToDelete, 'blogToDelete');
    if (!blogToDelete) throw new NotFoundException();
    const ability = this.caslAbilityFactory.createForUserId({
      id: blogToDelete.blogOwnerId,
    });
    try {
      ForbiddenError.from(ability).throwUnlessCan(Action.DELETE, {
        id: command.currentUser.id,
      });
      return await this.bloggerBlogsService.removeBlogById(command.id);
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      }
    }
  }
}

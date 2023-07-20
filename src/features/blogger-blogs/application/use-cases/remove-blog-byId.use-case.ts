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
    private readonly bloggerBlogsService: BloggerBlogsService,
    private readonly caslAbilityFactory: CaslAbilityFactory,
  ) {}
  async execute(command: RemoveBlogByIdCommand): Promise<void> {
    const blogToDelete = await this.bloggerBlogsService.findBlogById(
      command.id,
    );
    if (!blogToDelete) {
      throw new NotFoundException('Blog not found');
    }
    const ability = this.caslAbilityFactory.createForUserId({
      id: blogToDelete.blogOwnerId,
    });
    try {
      ForbiddenError.from(ability).throwUnlessCan(Action.DELETE, {
        id: command.currentUser.id,
      });

      await this.bloggerBlogsService.removeBlogById(command.id);
    } catch (error) {
      this.handleForbiddenError(error);
    }
  }

  private handleForbiddenError(error: any): void {
    if (error instanceof ForbiddenError) {
      throw new ForbiddenException('You are not allowed to delete this blog');
    }
    throw error; // Rethrow the error if it's not a ForbiddenError
  }
}

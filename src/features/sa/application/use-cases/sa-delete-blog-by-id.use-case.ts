import { CurrentUserDto } from '../../../users/dto/current-user.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../../ability/roles/action.enum';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BloggerBlogsRepo } from '../../../blogger-blogs/infrastructure/blogger-blogs.repo';
import { BloggerBlogsEntity } from '../../../blogger-blogs/entities/blogger-blogs.entity';

export class SaDeleteBlogByBlogIdCommand {
  constructor(
    public blogId: string,
    public currentUserDto: CurrentUserDto,
  ) {}
}

@CommandHandler(SaDeleteBlogByBlogIdCommand)
export class SaDeleteBlogByBlogIdUseCase
  implements ICommandHandler<SaDeleteBlogByBlogIdCommand>
{
  constructor(
    private readonly caslAbilityFactory: CaslAbilityFactory,
    private readonly bloggerBlogsRepo: BloggerBlogsRepo,
  ) {}
  async execute(command: SaDeleteBlogByBlogIdCommand): Promise<boolean> {
    const { blogId, currentUserDto } = command;

    const blogToRemove: BloggerBlogsEntity | null =
      await this.bloggerBlogsRepo.findBlogById(blogId);
    if (!blogToRemove)
      throw new NotFoundException(`User with ID ${blogId} not found`);

    await this.checkUserPermission(currentUserDto);

    return await this.bloggerBlogsRepo.saDeleteBlogDataById(blogId);
  }

  private async checkUserPermission(currentUserDto: CurrentUserDto) {
    const ability = this.caslAbilityFactory.createSaUser(currentUserDto);
    try {
      ForbiddenError.from(ability).throwUnlessCan(Action.DELETE, {
        id: currentUserDto.userId,
      });
    } catch (error) {
      throw new ForbiddenException(
        'You are not allowed to remove this blog. ' + error.message,
      );
    }
  }
}

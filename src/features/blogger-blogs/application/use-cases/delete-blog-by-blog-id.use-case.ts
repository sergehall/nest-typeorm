import { CurrentUserDto } from '../../../users/dto/current-user.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../../ability/roles/action.enum';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IdDto } from '../../../../ability/dto/id.dto';
import { BloggerBlogsRepo } from '../../infrastructure/blogger-blogs.repo';
import { BloggerBlogsEntity } from '../../entities/blogger-blogs.entity';

export class DeleteBlogByBlogIdCommand {
  constructor(
    public blogId: string,
    public currentUserDto: CurrentUserDto,
  ) {}
}

@CommandHandler(DeleteBlogByBlogIdCommand)
export class DeleteBlogByBlogIdUseCase
  implements ICommandHandler<DeleteBlogByBlogIdCommand>
{
  constructor(
    private readonly caslAbilityFactory: CaslAbilityFactory,
    private readonly bloggerBlogsRepo: BloggerBlogsRepo,
  ) {}
  async execute(command: DeleteBlogByBlogIdCommand): Promise<boolean> {
    const { blogId, currentUserDto } = command;

    const blogToRemove: BloggerBlogsEntity | null =
      await this.bloggerBlogsRepo.findBlogById(blogId);
    if (!blogToRemove) throw new NotFoundException('Not found blog.');

    await this.checkUserPermission(
      currentUserDto,
      blogToRemove.blogOwner.userId,
    );

    return await this.bloggerBlogsRepo.saDeleteBlogDataById(blogId);
  }

  private async checkUserPermission(
    currentUserDto: CurrentUserDto,
    blogOwnerId: string,
  ) {
    const userIdDto: IdDto = { id: currentUserDto.userId };
    const ability = this.caslAbilityFactory.createForUserId(userIdDto);
    try {
      ForbiddenError.from(ability).throwUnlessCan(Action.UPDATE, {
        id: blogOwnerId,
      });
    } catch (error) {
      throw new ForbiddenException(
        'You are not allowed to remove this blog. ' + error.message,
      );
    }
  }
}

import { CurrentUserDto } from '../../../users/dto/current-user.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../../ability/roles/action.enum';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BloggerBlogsRepo } from '../../infrastructure/blogger-blogs.repo';
import { UpdateBloggerBlogsDto } from '../../dto/update-blogger-blogs.dto';

export class UpdateBlogByIdCommand {
  constructor(
    public id: string,
    public updateBlogDto: UpdateBloggerBlogsDto,
    public currentUserDto: CurrentUserDto,
  ) {}
}
@CommandHandler(UpdateBlogByIdCommand)
export class UpdateBlogByIdUseCase
  implements ICommandHandler<UpdateBlogByIdCommand>
{
  constructor(
    private readonly caslAbilityFactory: CaslAbilityFactory,
    private readonly bloggerBlogsRepo: BloggerBlogsRepo,
  ) {}

  async execute(command: UpdateBlogByIdCommand): Promise<boolean> {
    const { id, updateBlogDto, currentUserDto } = command;
    const blogToUpdate = await this.bloggerBlogsRepo.findBlogById(id);
    if (!blogToUpdate) {
      throw new NotFoundException(`Blog with id: ${id} not found`);
    }

    await this.checkUpdatePermission(
      blogToUpdate.blogOwner.userId,
      currentUserDto,
    );

    return await this.bloggerBlogsRepo.updateBlogById(id, updateBlogDto);
  }

  private async checkUpdatePermission(
    blogOwnerId: string,
    currentUser: CurrentUserDto,
  ): Promise<void> {
    const ability = this.caslAbilityFactory.createForUserId({
      id: blogOwnerId,
    });

    try {
      ForbiddenError.from(ability).throwUnlessCan(Action.UPDATE, {
        id: currentUser.userId,
      });
    } catch (error) {
      throw new ForbiddenException(
        'You are not allowed to update this blog. ' + error.message,
      );
    }
  }
}

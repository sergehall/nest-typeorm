import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException } from '@nestjs/common';
import { BloggerBlogsRepo } from '../../../blogger-blogs/infrastructure/blogger-blogs.repo';
import { CreateBlogsDto } from '../../../blogger-blogs/dto/create-blogs.dto';
import { CurrentUserDto } from '../../../users/dto/current-user.dto';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../../ability/roles/action.enum';

export class SaUpdateBlogByIdCommand {
  constructor(
    public id: string,
    public updateBlogDto: CreateBlogsDto,
    public currentUserDto: CurrentUserDto,
  ) {}
}

@CommandHandler(SaUpdateBlogByIdCommand)
export class SaUpdateBlogByIdUseCase
  implements ICommandHandler<SaUpdateBlogByIdCommand>
{
  constructor(
    protected caslAbilityFactory: CaslAbilityFactory,
    protected bloggerBlogsRepo: BloggerBlogsRepo,
  ) {}
  async execute(command: SaUpdateBlogByIdCommand): Promise<boolean> {
    const { id, updateBlogDto, currentUserDto } = command;

    await this.checkUpdatePermission(currentUserDto);

    return await this.bloggerBlogsRepo.updateBlogById(id, updateBlogDto);
  }

  private async checkUpdatePermission(
    currentUser: CurrentUserDto,
  ): Promise<void> {
    const ability = this.caslAbilityFactory.createSaUser(currentUser);

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

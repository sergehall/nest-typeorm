import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import { CurrentUserDto } from '../../../users/dto/current-user.dto';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../../ability/roles/action.enum';
import {
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateBlogsDto } from '../../../blogger-blogs/dto/create-blogs.dto';
import { BloggerBlogsRepo } from '../../../blogger-blogs/infrastructure/blogger-blogs.repo';
import { BloggerBlogsViewModel } from '../../../blogger-blogs/views/blogger-blogs.view-model';

export class SaCreateBlogCommand {
  constructor(
    public createBlogsDto: CreateBlogsDto,
    public currentUser: CurrentUserDto,
  ) {}
}

@CommandHandler(SaCreateBlogCommand)
export class SaCreateBlogUseCase
  implements ICommandHandler<SaCreateBlogCommand>
{
  constructor(
    private readonly caslAbilityFactory: CaslAbilityFactory,
    private readonly bloggerBlogsRepo: BloggerBlogsRepo,
  ) {}
  async execute(command: SaCreateBlogCommand): Promise<BloggerBlogsViewModel> {
    const { createBlogsDto, currentUser } = command;

    await this.checkPermission(command.currentUser);

    return await this.bloggerBlogsRepo.createBlogs(createBlogsDto, currentUser);
  }

  private async checkPermission(currentUserDto: CurrentUserDto): Promise<void> {
    // In the future, you can add a checkPermission
    const ability = this.caslAbilityFactory.createSaUser(currentUserDto);
    try {
      ForbiddenError.from(ability).throwUnlessCan(
        Action.CREATE,
        currentUserDto,
      );
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      }
      throw new InternalServerErrorException(error.message);
    }
  }
}

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import { CurrentUserDto } from '../../../users/dto/current-user.dto';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../../ability/roles/action.enum';
import {
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { BloggerBlogsRepo } from '../../infrastructure/blogger-blogs.repo';
import { CreateBlogsDto } from '../../dto/create-blogs.dto';
import { BloggerBlogsViewModel } from '../../views/blogger-blogs.view-model';
import { BloggerBlogsService } from '../blogger-blogs.service';
import { BloggerBlogsWithImagesSubscribersViewModel } from '../../views/blogger-blogs-with-images-subscribers.view-model';

export class CreateBloggerBlogCommand {
  constructor(
    public createBloggerBlogsDto: CreateBlogsDto,
    public currentUser: CurrentUserDto,
  ) {}
}

@CommandHandler(CreateBloggerBlogCommand)
export class CreateBloggerBlogUseCase
  implements ICommandHandler<CreateBloggerBlogCommand>
{
  constructor(
    private readonly caslAbilityFactory: CaslAbilityFactory,
    private readonly bloggerBlogsService: BloggerBlogsService,
    private readonly bloggerBlogsRepo: BloggerBlogsRepo,
  ) {}
  async execute(
    command: CreateBloggerBlogCommand,
  ): Promise<BloggerBlogsWithImagesSubscribersViewModel> {
    const { createBloggerBlogsDto, currentUser } = command;

    await this.checkPermission(command.currentUser);

    const bloggerBlogsViewModel: BloggerBlogsViewModel =
      await this.bloggerBlogsRepo.createBlogs(
        createBloggerBlogsDto,
        currentUser,
      );

    return await this.bloggerBlogsService.addImagesSubscriberToBlogsEntity(
      bloggerBlogsViewModel,
    );
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

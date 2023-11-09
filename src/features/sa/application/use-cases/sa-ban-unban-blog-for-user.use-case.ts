import { SaBanBlogDto } from '../../dto/sa-ban-blog.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { Action } from '../../../../ability/roles/action.enum';
import { ForbiddenError } from '@casl/ability';
import { CurrentUserDto } from '../../../users/dto/current-user.dto';
import { cannotBlockOwnBlog } from '../../../../common/filters/custom-errors-messages';
import { BloggerBlogsRepo } from '../../../blogger-blogs/infrastructure/blogger-blogs.repo';
import { BloggerBlogsEntity } from '../../../blogger-blogs/entities/blogger-blogs.entity';

export class SaBanUnbanBlogCommand {
  constructor(
    public blogId: string,
    public saBanBlogDto: SaBanBlogDto,
    public currentUserDto: CurrentUserDto,
  ) {}
}

@CommandHandler(SaBanUnbanBlogCommand)
export class SaBanUnbanBlogUseCase
  implements ICommandHandler<SaBanUnbanBlogCommand>
{
  constructor(
    private readonly caslAbilityFactory: CaslAbilityFactory,
    private readonly bloggerBlogsRepo: BloggerBlogsRepo,
  ) {}
  async execute(command: SaBanUnbanBlogCommand) {
    const { blogId, saBanBlogDto, currentUserDto } = command;

    const blogForBan: BloggerBlogsEntity = await this.saGetBlogForBan(blogId);

    if (blogForBan.blogOwner.userId === currentUserDto.userId) {
      throw new HttpException(
        { message: cannotBlockOwnBlog },
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.checkUserPermission(currentUserDto, blogForBan.blogOwner.userId);

    return await this.bloggerBlogsRepo.saManageBlogAccess(
      blogForBan,
      saBanBlogDto,
    );
  }

  private async saGetBlogForBan(blogId: string): Promise<BloggerBlogsEntity> {
    const blogForBan: BloggerBlogsEntity | null =
      await this.bloggerBlogsRepo.saGetBlogForBan(blogId);
    if (!blogForBan)
      throw new NotFoundException(`Blog with ID ${blogId} not found`);
    return blogForBan;
  }

  private async checkUserPermission(
    currentUserDto: CurrentUserDto,
    blogOwnerId: string,
  ) {
    const ability = this.caslAbilityFactory.createSaUser(currentUserDto);
    try {
      ForbiddenError.from(ability).throwUnlessCan(Action.UPDATE, {
        id: blogOwnerId,
      });
    } catch (error) {
      throw new ForbiddenException(
        'You are not allowed to ban a user for this blog. ' + error.message,
      );
    }
  }
}

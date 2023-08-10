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
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { BloggerBlogsRawSqlRepository } from '../../../blogger-blogs/infrastructure/blogger-blogs-raw-sql.repository';
import { cannotBlockOwnBlog } from '../../../../exception-filter/custom-errors-messages';

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
    private readonly bloggerBlogsRawSqlRepository: BloggerBlogsRawSqlRepository,
  ) {}
  async execute(command: SaBanUnbanBlogCommand) {
    const { blogId, saBanBlogDto, currentUserDto } = command;

    const blogForBan = await this.saGetBlogForBan(blogId);

    if (blogForBan.blogOwnerId === currentUserDto.id) {
      throw new HttpException(
        { message: cannotBlockOwnBlog },
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.checkUserPermission(currentUserDto, blogForBan.blogOwnerId);

    return await this.bloggerBlogsRawSqlRepository.saBanUnbanBlog(
      blogId,
      saBanBlogDto,
    );
  }

  private async saGetBlogForBan(blogId: string) {
    const blogForBan =
      await this.bloggerBlogsRawSqlRepository.saFindBlogByBlogId(blogId);
    if (!blogForBan) throw new NotFoundException('Not found blog.');
    return blogForBan;
  }

  private async checkUserPermission(
    currentUserDto: CurrentUserDto,
    blogOwnerId: string,
  ) {
    const ability = await this.caslAbilityFactory.createSaUser(currentUserDto);
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

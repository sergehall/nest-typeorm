import { SaBanBlogDto } from '../../dto/sa-ban-blog.dto';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Action } from '../../../../ability/roles/action.enum';
import { ForbiddenError } from '@casl/ability';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { BloggerBlogsRawSqlRepository } from '../../../blogger-blogs/infrastructure/blogger-blogs-raw-sql.repository';
import { ChangeBanStatusPostsByBlogIdCommand } from '../../../posts/application/use-cases/change-banstatus-posts-by-blogid.use-case';
import { ChangeBanStatusCommentsByBlogIdCommand } from '../../../comments/application/use-cases/change-banStatus-comments-by-blogId.use-case';
import { ChangeBanStatusBlogsByBlogIdCommand } from './sa-change-banstatus-blogs-by-blog-id.use-case';
import { cannotBlockOwnBlog } from '../../../../exception-filter/custom-errors-messages';

export class SaBanBlogByBlogIdCommand {
  constructor(
    public blogId: string,
    public saBanBlogDto: SaBanBlogDto,
    public currentUserDto: CurrentUserDto,
  ) {}
}

@CommandHandler(SaBanBlogByBlogIdCommand)
export class SaBanBlogByBlogIUseCase
  implements ICommandHandler<SaBanBlogByBlogIdCommand>
{
  constructor(
    private readonly caslAbilityFactory: CaslAbilityFactory,
    private readonly bloggerBlogsRawSqlRepository: BloggerBlogsRawSqlRepository,
    private readonly commandBus: CommandBus,
  ) {}
  async execute(command: SaBanBlogByBlogIdCommand) {
    const { blogId, saBanBlogDto, currentUserDto } = command;

    const blogForBan = await this.saGetBlogForBan(blogId);

    if (blogForBan.blogOwnerId === currentUserDto.id) {
      throw new HttpException(
        { message: cannotBlockOwnBlog },
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.checkUserPermission(currentUserDto, blogForBan.blogOwnerId);

    await this.executeChangeBanStatusCommands(blogId, saBanBlogDto.isBanned);
    return true;
  }

  private async executeChangeBanStatusCommands(
    blogId: string,
    isBanned: boolean,
  ): Promise<boolean> {
    try {
      await Promise.all([
        this.commandBus.execute(
          new ChangeBanStatusBlogsByBlogIdCommand(blogId, isBanned),
        ),
        this.commandBus.execute(
          new ChangeBanStatusPostsByBlogIdCommand(blogId, isBanned),
        ),
        this.commandBus.execute(
          new ChangeBanStatusCommentsByBlogIdCommand(blogId, isBanned),
        ),
      ]);
      return true;
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
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

  private async saGetBlogForBan(blogId: string) {
    const blogForBan =
      await this.bloggerBlogsRawSqlRepository.saFindBlogByBlogId(blogId);
    if (!blogForBan) throw new NotFoundException('Not found blog.');
    return blogForBan;
  }
}

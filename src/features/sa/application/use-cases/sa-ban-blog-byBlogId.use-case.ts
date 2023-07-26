import { SaBanBlogDto } from '../../dto/sa-ban-blog.dto';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Action } from '../../../../ability/roles/action.enum';
import { ForbiddenError } from '@casl/ability';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { BloggerBlogsRawSqlRepository } from '../../../blogger-blogs/infrastructure/blogger-blogs-raw-sql.repository';
import { ChangeBanStatusBlogsByBlogIdCommand } from './sa-change-banStatus-blogs-byBlogId.use-case';
import { ChangeBanStatusPostsByBlogIdCommand } from '../../../posts/application/use-cases/change-banStatus-posts-byBlogId.use-case';
import { ChangeBanStatusCommentsByBlogIdCommand } from '../../../comments/application/use-cases/change-banStatus-comments-by-blogId.use-case';

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

    const blogForBan = await this.getBlogForBan(blogId);
    if (!blogForBan) throw new NotFoundException('Not found blog.');

    this.checkUserPermission(currentUserDto, blogForBan.blogOwnerId);

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

  private checkUserPermission(
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

  private async getBlogForBan(blogId: string) {
    const blogForBan = await this.bloggerBlogsRawSqlRepository.findBlogByBlogId(
      blogId,
    );
    if (!blogForBan) {
      throw new NotFoundException('Not found blog.');
    }
    return blogForBan;
  }
}

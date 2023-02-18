import { SaBanBlogDto } from '../../dto/sa-ban-blog.dto';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BloggerBlogsRepository } from '../../../blogger-blogs/infrastructure/blogger-blogs.repository';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Action } from '../../../../ability/roles/action.enum';
import { ForbiddenError } from '@casl/ability';
import { BanInfo } from '../../../blogger-blogs/entities/blogger-blogs-banned-users.entity';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { ChangeBanStatusPostsByBlogIdCommand } from '../../../posts/application/use-cases/change-banStatus-posts -by-blogId.use-case';

export class SaBanBlogCommand {
  constructor(
    public id: string,
    public saBanBlogDto: SaBanBlogDto,
    public currentUser: CurrentUserDto,
  ) {}
}

@CommandHandler(SaBanBlogCommand)
export class SaBanBlogUseCase implements ICommandHandler<SaBanBlogCommand> {
  constructor(
    protected caslAbilityFactory: CaslAbilityFactory,
    protected bloggerBlogsRepository: BloggerBlogsRepository,
    protected commandBus: CommandBus,
  ) {}
  async execute(command: SaBanBlogCommand) {
    const blogForBan = await this.bloggerBlogsRepository.findBlogById(
      command.id,
    );
    if (!blogForBan) throw new NotFoundException();
    const banInfo: BanInfo = {
      isBanned: command.saBanBlogDto.isBanned,
      banDate: new Date().toISOString(),
      banReason: "Because, I'm super admin :)",
    };
    const ability = this.caslAbilityFactory.createForUser(command.currentUser);

    try {
      ForbiddenError.from(ability).throwUnlessCan(
        Action.UPDATE,
        command.currentUser,
      );
      await this.commandBus.execute(
        new ChangeBanStatusPostsByBlogIdCommand(command.id, banInfo),
      );

      return await this.bloggerBlogsRepository.banBlog(blogForBan.id, banInfo);
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      }
      if (error instanceof NotFoundException) {
        throw new NotFoundException();
      }
    }
  }
}

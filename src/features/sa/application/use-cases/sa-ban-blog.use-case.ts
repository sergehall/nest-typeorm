import { SaBanBlogDto } from '../../dto/sa-ban-blog.dto';
import { User } from '../../../users/infrastructure/schemas/user.schema';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BloggerBlogsRepository } from '../../../blogger-blogs/infrastructure/blogger-blogs.repository';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Action } from '../../../../ability/roles/action.enum';
import { ForbiddenError } from '@casl/ability';
import { BanInfo } from '../../../blogger-blogs/entities/blogger-blogs-banned-users.entity';

export class SaBanBlogCommand {
  constructor(
    public id: string,
    public saBanBlogDto: SaBanBlogDto,
    public currentUser: User,
  ) {}
}

@CommandHandler(SaBanBlogCommand)
export class SaBanBlogUseCase implements ICommandHandler<SaBanBlogCommand> {
  constructor(
    protected caslAbilityFactory: CaslAbilityFactory,
    protected bloggerBlogsRepository: BloggerBlogsRepository,
  ) {}
  async execute(command: SaBanBlogCommand) {
    const blogForBan = await this.bloggerBlogsRepository.findBlogById(
      command.id,
    );
    if (!blogForBan) throw new NotFoundException();
    const banInfo: BanInfo = {
      isBanned: command.saBanBlogDto.isBanned,
      banDate: new Date().toISOString(),
      banReason: 'Because it was super admin',
    };
    const ability = this.caslAbilityFactory.createForBBlogs({
      id: command.currentUser.id,
    });
    try {
      ForbiddenError.from(ability).throwUnlessCan(Action.UPDATE, {
        id: command.currentUser.id,
      });
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

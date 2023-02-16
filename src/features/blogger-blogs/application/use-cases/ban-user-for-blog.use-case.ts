import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { UpdateBanUserDto } from '../../dto/update-ban-user.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../../ability/roles/action.enum';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import { BloggerBlogsRepository } from '../../infrastructure/blogger-blogs.repository';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BanInfo } from '../../entities/blogger-blogs-banned-users.entity';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { ChangeBanStatusPostsByBlogIdCommand } from '../../../posts/application/use-cases/change-banStatus-posts -by-blogId.use-case';
import { ChangeBanStatusCommentsByBlogIdCommand } from '../../../comments/application/use-cases/change-banStatus-comments-by-blogId.use-case';
import { AddBannedUserToBanListCommand } from './add-banned-user-to-ban-list.use-case';

export class BanUserForBlogCommand {
  constructor(
    public id: string,
    public updateBanUserDto: UpdateBanUserDto,
    public currentUser: CurrentUserDto,
  ) {}
}
@CommandHandler(BanUserForBlogCommand)
export class BanUserForBlogUseCase
  implements ICommandHandler<BanUserForBlogCommand>
{
  constructor(
    protected caslAbilityFactory: CaslAbilityFactory,
    protected usersRepository: UsersRepository,
    protected bloggerBlogsRepository: BloggerBlogsRepository,
    protected commandBus: CommandBus,
  ) {}
  async execute(command: BanUserForBlogCommand) {
    const userToBan = await this.usersRepository.findUserByUserId(command.id);
    if (!userToBan) throw new NotFoundException();
    const blogForBan = await this.bloggerBlogsRepository.findBlogById(
      command.updateBanUserDto.blogId,
    );
    if (!blogForBan) throw new NotFoundException();
    const banInfo: BanInfo = {
      isBanned: command.updateBanUserDto.isBanned,
      banDate: new Date().toISOString(),
      banReason: command.updateBanUserDto.banReason,
    };

    const ability = this.caslAbilityFactory.createForBBlogs({
      id: command.currentUser.id,
    });
    try {
      ForbiddenError.from(ability).throwUnlessCan(Action.UPDATE, {
        id: blogForBan.blogOwnerInfo.userId,
      });
      await this.commandBus.execute(
        new ChangeBanStatusPostsByBlogIdCommand(
          command.id,
          command.updateBanUserDto,
        ),
      );
      await this.commandBus.execute(
        new ChangeBanStatusCommentsByBlogIdCommand(
          command.id,
          command.updateBanUserDto.blogId,
          command.updateBanUserDto.isBanned,
        ),
      );
      await this.commandBus.execute(
        new AddBannedUserToBanListCommand(
          command.id,
          userToBan.login,
          command.updateBanUserDto,
        ),
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

import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { UpdateBanUserDto } from '../../dto/update-ban-user.dto';
import { User } from '../../../users/infrastructure/schemas/user.schema';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../../ability/roles/action.enum';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import { BloggerBlogsRepository } from '../../infrastructure/blogger-blogs.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BBlogsBannedUsersEntity } from '../../../comments/entities/bBlogs-banned-users.entity';

export class BanUserForBlogCommand {
  constructor(
    public id: string,
    public updateBanUserDto: UpdateBanUserDto,
    public currentUser: User,
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
  ) {}
  async execute(command: BanUserForBlogCommand) {
    const userToBan = await this.usersRepository.findUserByUserId(command.id);
    if (!userToBan) throw new NotFoundException();
    const blogForBan = await this.bloggerBlogsRepository.findBlogById(
      command.updateBanUserDto.blogId,
    );
    if (!blogForBan) throw new NotFoundException();
    const banUserInfo: BBlogsBannedUsersEntity = {
      blogId: command.updateBanUserDto.blogId,
      id: command.id,
      login: userToBan.login,
      createdAt: new Date().toISOString(),
      banInfo: {
        isBanned: command.updateBanUserDto.isBanned,
        banDate: new Date().toISOString(),
        banReason: command.updateBanUserDto.banReason,
      },
    };
    const ability = this.caslAbilityFactory.createForBBlogs({
      id: command.currentUser.id,
    });
    try {
      ForbiddenError.from(ability).throwUnlessCan(Action.UPDATE, {
        id: blogForBan.blogOwnerInfo.userId,
      });
      return await this.bloggerBlogsRepository.banUserForBlog(
        blogForBan.id,
        banUserInfo,
      );
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

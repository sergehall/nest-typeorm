import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateBanUserDto } from '../../dto/update-ban-user.dto';
import { BloggerBlogsRepository } from '../../infrastructure/blogger-blogs.repository';
import { UsersBannedByBlogIdEntity } from '../../entities/blogger-blogs-banned-users.entity';

export class AddBannedUserToBanListCommand {
  constructor(
    public userId: string,
    public userLogin: string,
    public updateBanUserDto: UpdateBanUserDto,
  ) {}
}
@CommandHandler(AddBannedUserToBanListCommand)
export class AddBannedUserToBanListUseCase
  implements ICommandHandler<AddBannedUserToBanListCommand>
{
  constructor(protected bloggerBlogsRepository: BloggerBlogsRepository) {}
  async execute(command: AddBannedUserToBanListCommand) {
    const bannedUser: UsersBannedByBlogIdEntity = {
      blogId: command.updateBanUserDto.blogId,
      id: command.userId,
      login: command.userLogin,
      banInfo: {
        isBanned: command.updateBanUserDto.isBanned,
        banDate: new Date().toISOString(),
        banReason: command.updateBanUserDto.banReason,
      },
    };
    return await this.bloggerBlogsRepository.addBannedUserToBanList(bannedUser);
  }
}

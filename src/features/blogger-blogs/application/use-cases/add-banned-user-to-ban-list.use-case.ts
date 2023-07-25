import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BannedUsersForBlogsRawSqlRepository } from '../../../users/infrastructure/banned-users-for-blogs-raw-sql.repository';
import { BannedUsersForBlogsEntity } from '../../entities/banned-users-for-blogs.entity';

export class AddBannedUserToBanListCommand {
  constructor(public bannedUserForBlogEntity: BannedUsersForBlogsEntity) {}
}
@CommandHandler(AddBannedUserToBanListCommand)
export class AddBannedUserToBanListUseCase
  implements ICommandHandler<AddBannedUserToBanListCommand>
{
  constructor(
    protected bannedUsersForBlogsRawSqlRepository: BannedUsersForBlogsRawSqlRepository,
  ) {}
  async execute(command: AddBannedUserToBanListCommand): Promise<boolean> {
    return await this.bannedUsersForBlogsRawSqlRepository.addBannedUserToBanList(
      command.bannedUserForBlogEntity,
    );
  }
}

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BloggerBlogsRawSqlRepository } from '../../../infrastructure/blogger-blogs-raw-sql.repository';

export class ChangeBanStatusUserBlogsCommand {
  constructor(public userId: string, public isBanned: boolean) {}
}
@CommandHandler(ChangeBanStatusUserBlogsCommand)
export class ChangeBanStatusOwnerBlogUseCase
  implements ICommandHandler<ChangeBanStatusUserBlogsCommand>
{
  constructor(
    protected bloggerBlogsRawSqlRepository: BloggerBlogsRawSqlRepository,
  ) {}
  async execute(command: ChangeBanStatusUserBlogsCommand): Promise<boolean> {
    return await this.bloggerBlogsRawSqlRepository.changeBanStatusBlogsDependencyIsBannedByUserId(
      command.userId,
      command.isBanned,
    );
  }
}

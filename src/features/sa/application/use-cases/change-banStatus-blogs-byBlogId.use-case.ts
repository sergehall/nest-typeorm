import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BloggerBlogsRawSqlRepository } from '../../../blogger-blogs/infrastructure/blogger-blogs-raw-sql.repository';

export class ChangeBanStatusBlogsByBlogIdCommand {
  constructor(public blogId: string, public isBanned: boolean) {}
}
@CommandHandler(ChangeBanStatusBlogsByBlogIdCommand)
export class ChangeBanStatusBlogsByBlogIdUseCase
  implements ICommandHandler<ChangeBanStatusBlogsByBlogIdCommand>
{
  constructor(
    protected bloggerBlogsRawSqlRepository: BloggerBlogsRawSqlRepository,
  ) {}
  async execute(command: ChangeBanStatusBlogsByBlogIdCommand) {
    await this.bloggerBlogsRawSqlRepository.changeBanStatusBlogsOwnerByUserId(
      command.blogId,
      command.isBanned,
    );
    return;
  }
}

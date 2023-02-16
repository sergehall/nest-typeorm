import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BloggerBlogsService } from '../blogger-blogs.service';

export class ChangeBanStatusUserBlogsCommand {
  constructor(public userId: string, public isBanned: boolean) {}
}
@CommandHandler(ChangeBanStatusUserBlogsCommand)
export class ChangeBanStatusOwnerBlogUseCase
  implements ICommandHandler<ChangeBanStatusUserBlogsCommand>
{
  constructor(protected bloggerBlogsService: BloggerBlogsService) {}
  async execute(command: ChangeBanStatusUserBlogsCommand) {
    await this.bloggerBlogsService.changeBanStatusOwnerBlog(
      command.userId,
      command.isBanned,
    );
    return;
  }
}

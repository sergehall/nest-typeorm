import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BloggerBlogsService } from '../blogger-blogs.service';

export class ChangeBanStatusOwnerBlogsCommand {
  constructor(public userId: string, public isBanned: boolean) {}
}
@CommandHandler(ChangeBanStatusOwnerBlogsCommand)
export class ChangeBanStatusOwnerBlogUseCase
  implements ICommandHandler<ChangeBanStatusOwnerBlogsCommand>
{
  constructor(protected bloggerBlogsService: BloggerBlogsService) {}
  async execute(command: ChangeBanStatusOwnerBlogsCommand) {
    await this.bloggerBlogsService.changeBanStatusOwnerBlog(
      command.userId,
      command.isBanned,
    );
    return;
  }
}

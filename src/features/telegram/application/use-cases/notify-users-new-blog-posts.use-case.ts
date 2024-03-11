import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import axios from 'axios';

export class NotifyUsersNewBlogPostsCommand {
  constructor(
    public readonly telegramIds: string[],
    public readonly blogPostTitle: string,
    public readonly blogPostLink: string,
  ) {}
}

@CommandHandler(NotifyUsersNewBlogPostsCommand)
export class NotifyUsersNewBlogPostsUseCase
  implements ICommandHandler<NotifyUsersNewBlogPostsCommand>
{
  async execute(command: NotifyUsersNewBlogPostsCommand) {
    const { telegramIds, blogPostTitle, blogPostLink } = command;

    const telegramBotToken = 'YOUR_TELEGRAM_BOT_TOKEN';

    for (const telegramId of telegramIds) {
      try {
        const message = `📢 New Blog Post: ${blogPostTitle}\nRead here: ${blogPostLink}`;
        await axios.post(
          `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
          {
            chat_id: telegramId,
            text: message,
          },
        );
        console.log(`Notification sent to Telegram ID ${telegramId}`);
      } catch (error) {
        console.error(
          `Failed to send notification to Telegram ID ${telegramId}: ${error.message}`,
        );
      }
    }
  }
}

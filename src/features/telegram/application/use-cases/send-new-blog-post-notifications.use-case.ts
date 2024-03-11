import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import axios from 'axios';
import { PostViewModel } from '../../../posts/views/post.view-model';
import { BloggerBlogsEntity } from '../../../blogger-blogs/entities/blogger-blogs.entity';
import { BlogsSubscribersRepo } from '../../../blogger-blogs/infrastructure/blogs-subscribers.repo';
import { TelegramBotStatusEntity } from '../../entities/telegram-bot-status.entity';
import { PostgresConfig } from '../../../../config/db/postgres/postgres.config';
import { TelegramConfig } from '../../../../config/telegram/telegram.config';

export class SendNewBlogPostNotificationsCommand {
  constructor(
    public readonly blog: BloggerBlogsEntity,
    public readonly newPost: PostViewModel,
  ) {}
}

@CommandHandler(SendNewBlogPostNotificationsCommand)
export class SendNewBlogPostNotificationsUseCase
  implements ICommandHandler<SendNewBlogPostNotificationsCommand>
{
  constructor(
    private readonly blogsSubscribersRepo: BlogsSubscribersRepo,
    private readonly postgresConfig: PostgresConfig,
    private readonly telegramConfig: TelegramConfig,
  ) {}
  async execute(command: SendNewBlogPostNotificationsCommand): Promise<void> {
    const { blog, newPost } = command;

    const subscribers: TelegramBotStatusEntity[] =
      await this.blogsSubscribersRepo.findSubscribersForBlogWithEnabledBot(
        blog.id,
      );
    const telegramIds: number[] = subscribers.map(
      (subscriber) => subscriber.telegramId,
    );

    const blogPostTitle: string = newPost.title;
    const blogPostName: string = blog.name;
    const blogPostDescription: string = blog.description;
    const baseUrl: string =
      await this.postgresConfig.getDomain('PG_DOMAIN_HEROKU');
    const blogPostLink: string = baseUrl + `/posts/${newPost.id}`;

    const telegramUrl =
      await this.telegramConfig.getTelegramUrlBotSendMessage();

    const message = `📢 New Blog Post: ${blogPostTitle}\\nRead and name: ${blogPostName}\nRead here: ${blogPostLink}. Description of post ${blogPostDescription}`;

    for (const telegramId of telegramIds) {
      try {
        await axios.post(telegramUrl, {
          chat_id: telegramId,
          text: message,
        });
        console.log(`Notification sent to Telegram ID ${telegramId}`);
      } catch (error) {
        console.error(
          `Failed to send notification to Telegram ID ${telegramId}: ${error.message}`,
        );
      }
    }
  }
}

import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { BlogsSubscribersEntity } from '../../blogger-blogs/entities/blogs-subscribers.entity';
import { CurrentUserDto } from '../../users/dto/current-user.dto';
import { TelegramApiEndpointsEnum } from '../enums/telegram-api-endpoints.enum';

@Injectable()
export class TelegramService {
  async getWebhook() {
    return { status: 'success' };
  }
  async sendPostNotifications(
    blogId: string,
    postTitle: string,
  ): Promise<void> {
    // Retrieve the list of subscribed users with activated bots for the given blog
    const subscribedUsers: BlogsSubscribersEntity[] = [];
    // const subscribedUsers =
    //   await this.bloggerService.getSubscribedUsersWithActivatedBots(blogId);

    // Construct the message content for the new blog post
    const message = `New post published for blog "${blogId}": ${postTitle}`;

    // Iterate through the list of subscribed users
    for (const user of subscribedUsers) {
      try {
        // Send a notification message to the user's activated bot
        // await this.sendMessageToBot(user.telegramBotId, message);
      } catch (error) {
        console.error(
          `Failed to send notification to user ${user.id}: ${error.message}`,
        );
      }
    }
  }

  async sendNotificationToUser(
    user: BlogsSubscribersEntity,
    message: string,
  ): Promise<void> {
    const botId = user.subscriber.userId;
    // Construct the message content
    const telegramMessage = { chat_id: botId, text: message };
    try {
      // Send the message to the user's activated bot
      await axios.post(
        'https://api.telegram.org/bot<YOUR_BOT_TOKEN>/sendMessage',
        telegramMessage,
      );
    } catch (error) {
      console.error(
        `Failed to send message to user ${user.id}: ${error.message}`,
      );
      throw new Error(`Failed to send message to user ${user.id}`);
    }
  }

  private async sendMessageToBot(
    botId: number,
    message: string,
  ): Promise<void> {
    // Retrieve the bot token from configuration or environment variables
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      throw new Error('Telegram bot token not provided');
    }
    const urlApiTelegram = TelegramApiEndpointsEnum.Bot;

    // Construct the Telegram API URL for sending messages
    const url = `${urlApiTelegram}${botToken}/sendMessage`;

    // Send the notification message to the bot
    await axios.post(url, {
      chat_id: botId,
      text: message,
    });
  }

  async generateActivationCode(currentUserDto: CurrentUserDto) {
    // Generate a unique activation code using UUID
    return {
      link: `https://t.me/activate-bot?code=${currentUserDto.userId}`,
    };
  }

  async activateBot(activationCode: string): Promise<boolean> {
    // // Check if the activation code is valid
    // const isValid = await this.isValidActivationCode(activationCode);
    // if (isValid) {
    //   // Activate the bot for the user associated with the activation code
    //   await this.activateBotForUser(activationCode);

    return true;
    // } else {
    //   return false;
    // }
  }
}

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogsSubscribersEntity } from '../entities/blogs-subscribers.entity';
import { CurrentUserDto } from '../../users/dto/current-user.dto';
import { BloggerBlogsEntity } from '../entities/blogger-blogs.entity';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SubscriptionStatus } from '../enums/subscription-status.enums';
import { UuidErrorResolver } from '../../../common/helpers/uuid-error-resolver';
import { BlogsSubscriptionStatusCountType } from '../types/blogs-subscription-status-count.type';
import { BotStatus } from '../../telegram/enums/bot-status.enum';
import { TelegramBotStatusEntity } from '../../telegram/entities/telegram-bot-status.entity';

export class BlogsSubscribersRepo {
  constructor(
    @InjectRepository(BlogsSubscribersEntity)
    private readonly blogsSubscribersRepository: Repository<BlogsSubscribersEntity>,
    @InjectRepository(TelegramBotStatusEntity)
    protected telegramBotStatusRepository: Repository<TelegramBotStatusEntity>,
    private readonly uuidErrorResolver: UuidErrorResolver,
  ) {}

  async findSubscribersForBlogWithEnabledBot(
    blogId: string,
  ): Promise<TelegramBotStatusEntity[]> {
    try {
      const result = await this.telegramBotStatusRepository
        .createQueryBuilder('telegramBotStatus')
        .innerJoinAndSelect('telegramBotStatus.user', 'user')
        .where('telegramBotStatus.botStatus = :botStatus', {
          botStatus: BotStatus.ENABLED,
        })
        .andWhere((qb) => {
          const subQuery = qb
            .subQuery()
            .select('subscriber.subscriber.userId')
            .from(BlogsSubscribersEntity, 'subscriber')
            .innerJoin('subscriber.blog', 'blog')
            .where('blog.id = :blogId', { blogId })
            .andWhere('subscriber.subscriptionStatus = :subscriptionStatus', {
              subscriptionStatus: SubscriptionStatus.Subscribed,
            })
            .getQuery();
          return `telegramBotStatus.userId IN (${subQuery})`;
        })
        .getMany();

      console.log('result', result);
      return result;
      // // Find subscribers for the given blog ID with subscriptionStatus Subscribed
      // const subscribers: BlogsSubscribersEntity[] =
      //   await this.blogsSubscribersRepository
      //     .createQueryBuilder('subscriber')
      //     .innerJoinAndSelect('subscriber.blog', 'blog')
      //     .innerJoinAndSelect('subscriber.subscriber', 'user')
      //     .where('blog.id = :blogId', { blogId })
      //     .andWhere('subscriber.subscriptionStatus = :subscriptionStatus', {
      //       subscriptionStatus: SubscriptionStatus.Subscribed,
      //     })
      //     .getMany();
      //
      // console.log('subscribers ', subscribers);
      // const subscriberIds: string[] = subscribers.map(
      //   (subscriber) => subscriber.subscriber.userId,
      // );
      //
      // // console.log('subscriberIds in', subscriberIds);
      // // const subId = 'a2664c57-83cf-485a-b1f0-9c8c2110d054';
      // // subscriberIds.push(subId);
      //
      // // Find TelegramBotStatusEntities for the found subscriber IDs with botStatus ENABLED
      // const result = await this.telegramBotStatusRepository
      //   .createQueryBuilder('telegramBotStatus')
      //   .innerJoinAndSelect('telegramBotStatus.user', 'user')
      //   .where('telegramBotStatus.botStatus = :botStatus', {
      //     botStatus: BotStatus.ENABLED,
      //   })
      //   .andWhere('telegramBotStatus.userId IN (:...subscriberIds)', {
      //     subscriberIds,
      //   })
      //   .getMany();
      // console.log('result', result);
      // return result;
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(
        'An error occurred while finding subscribers for blog with enabled bot.',
      );
    }
  }

  async blogsSubscribersStatusCount(
    blogIds: string[],
    currentUserDto: CurrentUserDto | null,
  ): Promise<BlogsSubscriptionStatusCountType[]> {
    const subscriptionStatus = SubscriptionStatus.Subscribed;
    const isBanned = false;
    const dependencyIsBanned = false;
    const subscriberId = currentUserDto?.userId;
    try {
      return await this.blogsSubscribersRepository
        .createQueryBuilder('subscribers')
        .select([
          'blog.id AS "blogId"',
          `(SELECT COALESCE(COUNT(subscribers.id)::int, 0) FROM "BlogsSubscribers" subscribers WHERE subscribers.blogId = blog.id AND subscribers.subscriptionStatus = :subscriptionStatus) AS "subscribersCount"`,
          `(SELECT COALESCE(MAX(subscribers.subscriptionStatus), :defaultStatus) FROM "BlogsSubscribers" subscribers WHERE subscribers.blogId = blog.id AND subscribers.subscriber.userId = :subscriberId) AS "currentUserSubscriptionStatus"`,
        ])
        .leftJoin('subscribers.blog', 'blog')
        .leftJoin('subscribers.subscriber', 'subscriber')
        .where({ isBanned, dependencyIsBanned })
        .andWhere('blog.id IN (:...blogIds)', { blogIds })
        .groupBy('blog.id') // Group only by blog.id
        .setParameter('subscriptionStatus', subscriptionStatus)
        .setParameter('defaultStatus', SubscriptionStatus.None)
        .setParameter('subscriberId', subscriberId)
        .getRawMany();
    } catch (error) {
      if (await this.uuidErrorResolver.isInvalidUUIDError(error)) {
        const blogId =
          await this.uuidErrorResolver.extractUserIdFromError(error);
        throw new NotFoundException(`Blog with ID ${blogId} not found`);
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async manageBlogsSubscribe(
    subscriptionStatus: SubscriptionStatus,
    blog: BloggerBlogsEntity,
    currentUserDto: CurrentUserDto,
  ): Promise<BlogsSubscribersEntity> {
    try {
      // Find if there's an existing entry in BlogsSubscribersEntity
      const existingSubscriber: BlogsSubscribersEntity | null =
        await this.blogsSubscribersRepository.findOne({
          where: {
            blog: { id: blog.id },
            subscriber: { userId: currentUserDto.userId },
          },
        });
      if (existingSubscriber) {
        // If exists, update createdAt and subscriptionStatus
        existingSubscriber.createdAt = new Date().toISOString();
        existingSubscriber.subscriptionStatus = subscriptionStatus;
        return await this.blogsSubscribersRepository.save(existingSubscriber);
      } else {
        const blogsSubscribersEntity: BlogsSubscribersEntity =
          BlogsSubscribersEntity.createBlogsSubscribersEntity(
            subscriptionStatus,
            blog,
            currentUserDto,
          );

        return await this.blogsSubscribersRepository.save(
          blogsSubscribersEntity,
        );
      }
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(
        'An error occurred while managing blog subscription.',
      );
    }
  }
}

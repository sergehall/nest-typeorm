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
import { SubscriptionStatusAndCountType } from '../types/subscription-status-and-count.type';
import { BlogIdSubscriptionStatusAndCountType } from '../types/blogId-subscription-status-and-count.type';

export class BlogsSubscribersRepo {
  constructor(
    @InjectRepository(BlogsSubscribersEntity)
    private readonly blogsSubscribersRepository: Repository<BlogsSubscribersEntity>,
    private readonly uuidErrorResolver: UuidErrorResolver,
  ) {}

  async blogSubscribersAndCount(
    blogId: string,
    currentUserDto: CurrentUserDto | null,
  ): Promise<SubscriptionStatusAndCountType> {
    const isBanned = false;
    const dependencyIsBanned = false;
    const subscriptionStatus = SubscriptionStatus.Subscribed;
    const subscriberId = currentUserDto?.userId;

    try {
      const [subscriber, subscribersCount] = await Promise.all([
        this.blogsSubscribersRepository
          .createQueryBuilder('subscribers')
          .leftJoinAndSelect('subscribers.blog', 'blog')
          .leftJoinAndSelect('subscribers.subscriber', 'subscriber')
          .where('subscriber.userId = :subscriberId', { subscriberId })
          .andWhere('blog.id = :blogId', { blogId })
          .andWhere({ isBanned })
          .andWhere({ dependencyIsBanned })
          .getOne(),
        this.blogsSubscribersRepository
          .createQueryBuilder('subscribers')
          .leftJoin('subscribers.blog', 'blog')
          .where('blog.id = :blogId', { blogId })
          .andWhere('subscribers.subscriptionStatus = :subscriptionStatus', {
            subscriptionStatus,
          })
          .andWhere({ isBanned })
          .andWhere({ dependencyIsBanned })
          .getCount(),
      ]);
      return {
        currentUserSubscriptionStatus:
          subscriber?.subscriptionStatus || SubscriptionStatus.None,
        subscribersCount: subscribersCount || 0,
      };
    } catch (error) {
      if (await this.uuidErrorResolver.isInvalidUUIDError(error)) {
        const blogId = await this.uuidErrorResolver.extractUserIdFromError(
          error,
        );
        throw new NotFoundException(`Blog with ID ${blogId} not found`);
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async blogsSubscribersAndCount(
    blogIds: string[],
    currentUserDto: CurrentUserDto | null,
  ): Promise<BlogIdSubscriptionStatusAndCountType[]> {
    try {
      const isBanned = false;
      const dependencyIsBanned = false;
      const subscriptionStatus = SubscriptionStatus.Subscribed;
      const subscriberId = currentUserDto?.userId;

      // Execute both queries concurrently
      const [subscribers, subscribersCounts] = await Promise.all([
        this.blogsSubscribersRepository
          .createQueryBuilder('subscribers')
          .leftJoinAndSelect('subscribers.blog', 'blog')
          .leftJoinAndSelect('subscribers.subscriber', 'subscriber')
          .where({ isBanned })
          .andWhere({ dependencyIsBanned })
          .andWhere('blog.id IN (:...blogIds)', { blogIds })
          .getMany(),
        this.blogsSubscribersRepository
          .createQueryBuilder('subscribers')
          .select('blog.id', 'blogId')
          .addSelect('COUNT(subscribers.id)', 'subscribersCount')
          .leftJoin('subscribers.blog', 'blog')
          .where({ isBanned })
          .andWhere({ dependencyIsBanned })
          .andWhere('blog.id IN (:...blogIds)', { blogIds })
          .andWhere('subscribers.subscriptionStatus = :subscriptionStatus', {
            subscriptionStatus,
          })
          .groupBy('blog.id')
          .getRawMany(),
      ]);

      // Create subscribers count map
      const subscribersCountMap: { [blogId: string]: number } = {};
      for (const { blogId, subscribersCount } of subscribersCounts) {
        subscribersCountMap[blogId] = +subscribersCount; // Convert to number if necessary
      }

      // Create result array
      const result: BlogIdSubscriptionStatusAndCountType[] = [];
      for (const subscriber of subscribers) {
        result.push({
          blogId: subscriber.blog.id,
          currentUserSubscriptionStatus:
            subscriber?.subscriptionStatus || SubscriptionStatus.None,
          subscribersCount: subscribersCountMap[subscriber.blog.id] || 0,
        });
      }

      return result;
    } catch (error) {
      if (await this.uuidErrorResolver.isInvalidUUIDError(error)) {
        const blogId = await this.uuidErrorResolver.extractUserIdFromError(
          error,
        );
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

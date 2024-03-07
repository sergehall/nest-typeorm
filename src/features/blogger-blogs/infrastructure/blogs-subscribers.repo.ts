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

export class BlogsSubscribersRepo {
  constructor(
    @InjectRepository(BlogsSubscribersEntity)
    private readonly blogsSubscribersRepository: Repository<BlogsSubscribersEntity>,
    private readonly uuidErrorResolver: UuidErrorResolver,
  ) {}

  // async blogSubscribersAndCount(
  //   blogId: string,
  //   currentUserDto: CurrentUserDto | null,
  // ): Promise<SubscriptionStatusAndCountType> {
  //   const isBanned = false;
  //   const dependencyIsBanned = false;
  //   const subscriptionStatus = SubscriptionStatus.Subscribed;
  //   const subscriberId = currentUserDto?.userId;
  //
  //   try {
  //     const [subscriber, subscribersCount] = await Promise.all([
  //       this.blogsSubscribersRepository
  //         .createQueryBuilder('subscribers')
  //         .leftJoinAndSelect('subscribers.blog', 'blog')
  //         .leftJoinAndSelect('subscribers.subscriber', 'subscriber')
  //         .where('subscriber.userId = :subscriberId', { subscriberId })
  //         .andWhere('blog.id = :blogId', { blogId })
  //         .andWhere({ isBanned })
  //         .andWhere({ dependencyIsBanned })
  //         .getOne(),
  //       this.blogsSubscribersRepository
  //         .createQueryBuilder('subscribers')
  //         .leftJoin('subscribers.blog', 'blog')
  //         .where('blog.id = :blogId', { blogId })
  //         .andWhere('subscribers.subscriptionStatus = :subscriptionStatus', {
  //           subscriptionStatus,
  //         })
  //         .andWhere({ isBanned })
  //         .andWhere({ dependencyIsBanned })
  //         .getCount(),
  //     ]);
  //
  //     return {
  //       blogId: blogId,
  //       subscriberId: subscriber?.subscriber.userId || '',
  //       currentUserSubscriptionStatus:
  //         subscriber?.subscriptionStatus || SubscriptionStatus.None,
  //       subscribersCount: subscribersCount || 0,
  //     };
  //   } catch (error) {
  //     if (await this.uuidErrorResolver.isInvalidUUIDError(error)) {
  //       const blogId =
  //         await this.uuidErrorResolver.extractUserIdFromError(error);
  //       throw new NotFoundException(`Blog with ID ${blogId} not found`);
  //     }
  //     throw new InternalServerErrorException(error.message);
  //   }
  // }

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

  // async blogsSubscribersAndCountOld(
  //   blogIds: string[],
  //   currentUserDto: CurrentUserDto | null,
  // ): Promise<SubscriptionStatusAndCountType[]> {
  //   try {
  //     const isBanned = false;
  //     const dependencyIsBanned = false;
  //     const subscriptionStatus = SubscriptionStatus.Subscribed;
  //     const currSubscriberId = currentUserDto?.userId;
  //
  //     const [subscribers, subscribersCounts] = await Promise.all([
  //       this.querySubscribers(isBanned, dependencyIsBanned, blogIds),
  //       this.querySubscriberCounts(
  //         isBanned,
  //         dependencyIsBanned,
  //         blogIds,
  //         subscriptionStatus,
  //       ),
  //     ]);
  //
  //     const subscribersCountMap =
  //       await this.createSubscribersCountMap(subscribersCounts);
  //
  //     return await this.createResultArray(
  //       subscribers,
  //       subscribersCountMap,
  //       currSubscriberId,
  //     );
  //   } catch (error) {
  //     if (await this.uuidErrorResolver.isInvalidUUIDError(error)) {
  //       const blogId =
  //         await this.uuidErrorResolver.extractUserIdFromError(error);
  //       throw new NotFoundException(`Blog with ID ${blogId} not found`);
  //     }
  //     throw new InternalServerErrorException(error.message);
  //   }
  // }
  //
  // async querySubscribers(
  //   isBanned: boolean,
  //   dependencyIsBanned: boolean,
  //   blogIds: string[],
  // ): Promise<BlogsSubscribersEntity[]> {
  //   return this.blogsSubscribersRepository
  //     .createQueryBuilder('subscribers')
  //     .leftJoinAndSelect('subscribers.blog', 'blog')
  //     .leftJoinAndSelect('subscribers.subscriber', 'subscriber')
  //     .where({ isBanned })
  //     .andWhere({ dependencyIsBanned })
  //     .andWhere('blog.id IN (:...blogIds)', { blogIds })
  //     .getMany();
  // }
  //
  // async querySubscriberCounts(
  //   isBanned: boolean,
  //   dependencyIsBanned: boolean,
  //   blogIds: string[],
  //   subscriptionStatus: SubscriptionStatus,
  // ): Promise<
  //   {
  //     blogId: string;
  //     subscribersCount: string;
  //   }[]
  // > {
  //   return this.blogsSubscribersRepository
  //     .createQueryBuilder('subscribers')
  //     .select('blog.id', 'blogId')
  //     .addSelect('COUNT(subscribers.id)', 'subscribersCount')
  //     .leftJoin('subscribers.blog', 'blog')
  //     .where({ isBanned })
  //     .andWhere({ dependencyIsBanned })
  //     .andWhere('blog.id IN (:...blogIds)', { blogIds })
  //     .andWhere('subscribers.subscriptionStatus = :subscriptionStatus', {
  //       subscriptionStatus,
  //     })
  //     .groupBy('blog.id')
  //     .getRawMany();
  // }
  //
  // async createSubscribersCountMap(
  //   subscribersCounts: any[],
  // ): Promise<{ [blogId: string]: number }> {
  //   const subscribersCountMap: { [blogId: string]: number } = {};
  //   for (const { blogId, subscribersCount } of subscribersCounts) {
  //     subscribersCountMap[blogId] = +subscribersCount;
  //   }
  //   return subscribersCountMap;
  // }
  //
  // async createResultArray(
  //   subscribers: any[],
  //   subscribersCountMap: { [blogId: string]: number },
  //   currSubscriberId: string | undefined,
  // ): Promise<SubscriptionStatusAndCountType[]> {
  //   const result: {
  //     blogId: string;
  //     subscriberId: string;
  //     currentUserSubscriptionStatus: SubscriptionStatus;
  //     subscribersCount: number;
  //   }[] = [];
  //
  //   for (const subscriber of subscribers) {
  //     const existingSubscriberIndex = result.findIndex(
  //       (item) => item.blogId === subscriber.blog.id,
  //     );
  //
  //     if (existingSubscriberIndex !== -1) {
  //       const existingSubscriber = result[existingSubscriberIndex];
  //       if (existingSubscriber.subscriberId !== currSubscriberId) {
  //         existingSubscriber.subscriberId = subscriber.subscriber.userId;
  //         existingSubscriber.currentUserSubscriptionStatus =
  //           subscriber.subscriptionStatus;
  //       }
  //       continue;
  //     }
  //
  //     result.push({
  //       blogId: subscriber.blog.id,
  //       subscriberId: subscriber.subscriber.userId,
  //       currentUserSubscriptionStatus: subscriber.subscriptionStatus,
  //       subscribersCount: subscribersCountMap[subscriber.blog.id] || 0,
  //     });
  //   }
  //
  //   return result;
  // }

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

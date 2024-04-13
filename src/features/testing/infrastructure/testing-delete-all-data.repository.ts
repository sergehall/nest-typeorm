import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { DatabaseHasBeenClearedEvent } from '../events/database-has-been-cleared.event';
import { EventBus } from '@nestjs/cqrs';

@Injectable()
export class TestingDeleteAllDataRepository {
  constructor(
    private readonly entityManager: EntityManager,
    protected eventBus: EventBus,
  ) {}

  async removeAllData(): Promise<void> {
    const tablesToDelete = [
      'Messages',
      'Conversations',
      'PaymentTransactions',
      'OrderItems',
      'ImagesPostsSmallMetadata',
      'ImagesPostsMiddleMetadata',
      'ImagesPostsOriginalMetadata',
      'ImagesBlogsMainMetadata',
      'ImagesBlogsWallpaperMetadata',
      'ProductsData',
      'TelegramBotStatus',
      'BlogsSubscribers',
      'ChallengeAnswers',
      'ChallengeQuestions',
      'PairsGame',
      'QuestionsQuiz',
      'SentCodesLog',
      'BannedUsersForBlogs',
      'SecurityDevices',
      'InvalidJwt',
      'LikeStatusComments',
      'LikeStatusPosts',
      'Comments',
      'Posts',
      'BloggerBlogs',
      'OrdersEntity',
      'GuestUsers',
      'Users',
    ];

    // the database has been cleared
    try {
      await this.entityManager.transaction(
        async (transactionalEntityManager) => {
          for (const table of tablesToDelete) {
            await transactionalEntityManager
              .createQueryBuilder()
              .delete()
              .from(table)
              .execute();
          }
        },
      );

      this.eventBus.publish(new DatabaseHasBeenClearedEvent(tablesToDelete));
    } catch (error) {
      console.error(error.message);
      throw new InternalServerErrorException(
        'Failed to remove data. ' + error.message,
      );
    }
  }
}

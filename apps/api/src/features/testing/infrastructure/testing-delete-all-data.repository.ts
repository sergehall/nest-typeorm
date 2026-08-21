import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { EntityManager, EntityTarget, ObjectLiteral } from 'typeorm';
import { DatabaseHasBeenClearedEvent } from '../events/database-has-been-cleared.event';
import { EventBus } from '@nestjs/cqrs';
import { UsersEntity } from '../../users/entities/users.entity';
import { SentCodesLogEntity } from '../../../common/mails/entities/sent-codes-log.entity';

@Injectable()
export class TestingDeleteAllDataRepository {
  constructor(
    private readonly entityManager: EntityManager,
    protected eventBus: EventBus,
  ) {}

  async removeAllData(): Promise<void> {
    const tablesToDelete: EntityTarget<ObjectLiteral>[] = [
      'nt-Messages',
      'nt-Conversations',
      'nt-PaymentTransactions',
      'nt-OrderItems',
      'nt-ImagesPostsSmallMetadata',
      'nt-ImagesPostsMiddleMetadata',
      'nt-ImagesPostsOriginalMetadata',
      'nt-ImagesBlogsMainMetadata',
      'nt-ImagesBlogsWallpaperMetadata',
      'nt-ProductsData',
      'nt-TelegramBotStatus',
      'nt-BlogsSubscribers',
      'nt-ChallengeAnswers',
      'nt-ChallengeQuestions',
      'nt-PairsGame',
      'nt-QuestionsQuiz',
      SentCodesLogEntity,
      'nt-BannedUsersForBlogs',
      'nt-SecurityDevices',
      'nt-InvalidJwt',
      'nt-LikeStatusComments',
      'nt-LikeStatusPosts',
      'nt-Comments',
      'nt-Posts',
      'nt-BloggerBlogs',
      'nt-Orders',
      'nt-GuestUsers',
      UsersEntity,
    ];
    const clearedTableNames = tablesToDelete.map((table) =>
      typeof table === 'string' ? table : table === UsersEntity ? 'nt-users' : 'nt-sent-codes-log',
    );

    // the database has been cleared
    try {
      await this.entityManager.transaction(async (transactionalEntityManager) => {
        for (const table of tablesToDelete) {
          await transactionalEntityManager.createQueryBuilder().delete().from(table).execute();
        }
      });

      this.eventBus.publish(new DatabaseHasBeenClearedEvent(clearedTableNames));
    } catch (error) {
      console.error(error.message);
      throw new InternalServerErrorException('Failed to remove data. ' + error.message);
    }
  }
}

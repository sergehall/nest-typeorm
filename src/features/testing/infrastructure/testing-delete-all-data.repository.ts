import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { EntityManager } from 'typeorm';

@Injectable()
export class TestingDeleteAllDataRepository {
  constructor(private readonly entityManager: EntityManager) {}

  async removeAllData(): Promise<void> {
    const tablesToDelete = [
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
      'Users',
    ];

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
    } catch (error) {
      console.error(error.message);
      throw new InternalServerErrorException(
        'Failed to remove data. ' + error.message,
      );
    }
  }
}

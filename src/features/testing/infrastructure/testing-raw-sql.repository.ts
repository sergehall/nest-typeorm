import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class TestingRawSqlRepository {
  constructor(@InjectDataSource() private readonly db: DataSource) {}

  async removeAllData(): Promise<void> {
    const tablesToDelete = [
      'SentEmailsTimeConfirmAndRecoverCodes',
      'SecurityDevices',
      'BannedUsersForBlogs',
      'BlacklistJwt',
      'EmailsConfirmationCodes',
      'EmailsRecoveryCodes',
      'LikeStatusComments',
      'LikeStatusPosts',
      'Comments',
      'Posts',
      'BloggerBlogs',
      'Users',
    ];

    try {
      for (const table of tablesToDelete) {
        const query = `DELETE FROM public."${table}"`;
        await this.db.query(query);
      }
    } catch (error) {
      console.error(error.message);
      throw new InternalServerErrorException('Failed to remove data.');
    }
  }
}

// export class TestingRawSqlRepository {
//   constructor(
//     @InjectEntityManager() private readonly entityManager: EntityManager,
//   ) {}
//
//   async removeAllData(): Promise<void> {
//     const tablesToDelete = [
//       'SecurityDevices',
//       'SentEmailsTimeConfirmAndRecoverCodes',
//       'BannedUsersForBlogs',
//       'BlacklistJwt',
//       'EmailsConfirmationCodes',
//       'EmailsRecoveryCodes',
//       'LikeStatusComments',
//       'LikeStatusPosts',
//       'Comments',
//       'Posts',
//       'BloggerBlogs',
//       'Users',
//     ];
//
//     try {
//       for (const table of tablesToDelete) {
//         console.log(table);
//         const repository = this.entityManager.getRepository(table);
//         await repository.clear();
//       }
//     } catch (error) {
//       console.error(error.message);
//       throw new InternalServerErrorException('Failed to remove data.');
//     }
//   }
// }

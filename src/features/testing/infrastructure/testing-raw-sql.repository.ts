import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';

export class TestingRawSqlRepository {
  constructor(@InjectDataSource() private readonly db: DataSource) {}

  async removeAllDataRawSQL(): Promise<void> {
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

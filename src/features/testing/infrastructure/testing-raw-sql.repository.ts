import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class TestingRawSqlRepository {
  constructor(@InjectDataSource() private readonly db: DataSource) {}

  async removeAllData(): Promise<void> {
    const tablesToDelete = [
      'SentCodeLog',
      'SecurityDevices',
      'BannedUsersForBlogs',
      'BlacklistJwt',
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
      throw new InternalServerErrorException(
        'Failed to remove data.' + error.message,
      );
    }
  }
}

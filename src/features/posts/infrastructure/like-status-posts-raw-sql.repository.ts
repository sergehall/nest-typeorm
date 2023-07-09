import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export class LikeStatusPostsRawSqlRepository {
  constructor(@InjectDataSource() private readonly db: DataSource) {}
}

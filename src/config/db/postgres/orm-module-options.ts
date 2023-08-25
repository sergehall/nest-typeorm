import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { PostgresConfig } from './postgres.config';
import { UsersEntity } from '../../../features/users/entities/users.entity';
import { SecurityDevicesEntity } from '../../../features/security-devices/entities/session-devices.entity';
import { BloggerBlogsEntity } from '../../../features/blogger-blogs/entities/blogger-blogs.entity';
import { CommentsEntity } from '../../../features/comments/entities/comments.entity';
import { PostsEntity } from '../../../features/posts/entities/posts.entity';
import { BannedUsersForBlogsEntity } from '../../../features/blogger-blogs/entities/banned-users-for-blogs.entity';
import { LikeStatusPostsEntity } from '../../../features/posts/entities/like-status-posts.entity';
import { LikeStatusCommentsEntity } from '../../../features/comments/entities/like-status-comments.entity';
import { BlacklistJwtEntity } from '../../../features/auth/entities/blacklist-jwt.entity';
import { SentCodesLogEntity } from '../../../mails/infrastructure/sent-codes-log.entity';

@Injectable()
export class OrmModuleOptions
  extends PostgresConfig
  implements TypeOrmOptionsFactory
{
  async createTypeOrmOptions(): Promise<TypeOrmModuleOptions> {
    const host = await this.getHost('PG_HOST_HEROKU');
    const port = await this.getPort('PG_PORT');
    const username = await this.getAuth('PG_HEROKU_USER_NAME');
    const password = await this.getAuth('PG_HEROKU_USER_PASSWORD');
    const database = await this.getNamesDatabase('PG_HEROKU_NAME_DATABASE');

    return {
      type: 'postgres',
      host,
      port,
      username,
      password,
      database,
      ssl: { rejectUnauthorized: false },
      entities: [
        UsersEntity,
        SecurityDevicesEntity,
        CommentsEntity,
        BloggerBlogsEntity,
        PostsEntity,
        BannedUsersForBlogsEntity,
        LikeStatusPostsEntity,
        LikeStatusCommentsEntity,
        BlacklistJwtEntity,
        SentCodesLogEntity,
      ],
      synchronize: true,
      logging: false,
    };
  }
}

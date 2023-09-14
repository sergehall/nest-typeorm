import { DataSource, DataSourceOptions } from 'typeorm';
import { UsersEntity } from '../features/users/entities/users.entity';
import { SecurityDevicesEntity } from '../features/security-devices/entities/session-devices.entity';
import { BloggerBlogsEntity } from '../features/blogger-blogs/entities/blogger-blogs.entity';
import { PostsEntity } from '../features/posts/entities/posts.entity';
import { CommentsEntity } from '../features/comments/entities/comments.entity';
import { BannedUsersForBlogsEntity } from '../features/users/entities/banned-users-for-blogs.entity';
import { LikeStatusPostsEntity } from '../features/posts/entities/like-status-posts.entity';
import { LikeStatusCommentsEntity } from '../features/comments/entities/like-status-comments.entity';
import { InvalidJwtEntity } from '../features/auth/entities/invalid-jwt.entity';
import { SentCodesLogEntity } from '../mails/infrastructure/entities/sent-codes-log.entity';

const dataSourceOptions: DataSourceOptions = {
  type: 'postgres', // Change to your database type
  host: process.env.PG_HOST_HEROKU || 'localhost',
  port: parseInt(process.env.PG_PORT || '5432', 10),
  username: process.env.PG_HEROKU_USER_NAME || 'migration_user',
  password: process.env.PG_HEROKU_USER_PASSWORD || 'migration_password',
  database: process.env.PG_HEROKU_NAME_DATABASE || 'migration_database',
  entities: [
    UsersEntity,
    SecurityDevicesEntity,
    BloggerBlogsEntity,
    PostsEntity,
    CommentsEntity,
    BannedUsersForBlogsEntity,
    LikeStatusPostsEntity,
    LikeStatusCommentsEntity,
    InvalidJwtEntity,
    SentCodesLogEntity,
  ],
  synchronize: false,
  migrations: ['dist/db/migrations/*.js'], // Specify the path to your migrations
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;

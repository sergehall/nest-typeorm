import { Module } from '@nestjs/common';
import { ScheduledTasksService } from './scheduled-tasks.service';
import { MailsModule } from '../mails/mails.module';
import { UsersService } from '../features/users/application/users.service';
import { CaslModule } from '../ability/casl.module';
import { CqrsModule } from '@nestjs/cqrs';
import { UsersRawSqlRepository } from '../features/users/infrastructure/users-raw-sql.repository';
import { LikeStatusPostsRawSqlRepository } from '../features/posts/infrastructure/like-status-posts-raw-sql.repository';
import { LikeStatusCommentsRawSqlRepository } from '../features/comments/infrastructure/like-status-comments-raw-sql.repository';
import { CommentsRawSqlRepository } from '../features/comments/infrastructure/comments-raw-sql.repository';
import { PostsRawSqlRepository } from '../features/posts/infrastructure/posts-raw-sql.repository';
import { BloggerBlogsRawSqlRepository } from '../features/blogger-blogs/infrastructure/blogger-blogs-raw-sql.repository';
import { BannedUsersForBlogsRawSqlRepository } from '../features/users/infrastructure/banned-users-for-blogs-raw-sql.repository';
import { MailerConfig } from '../config/mailer/mailer-config';
import { PostgresConfig } from '../config/db/postgres/postgres.config';
import { DataCleanupService } from '../data-cleanup/data-cleanup.service';
import { SentCodeLogRepository } from '../mails/infrastructure/sent-code-log.repository';
import { MailOptionsBuilder } from '../mails/mail-options/mail-options-builder';
import { KeyResolver } from '../common/helpers/key-resolver';
import { UsersRepo } from '../features/users/infrastructure/users-repo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from '../features/users/entities/users.entity';
import { InvalidJwtRepo } from '../features/auth/infrastructure/invalid-jwt-repo';
import { InvalidJwtEntity } from '../features/auth/entities/invalid-jwt.entity';
import { SecurityDevicesEntity } from '../features/security-devices/entities/session-devices.entity';
import { SecurityDevicesRepo } from '../features/security-devices/infrastructure/security-devices.repo';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsersEntity,
      InvalidJwtEntity,
      SecurityDevicesEntity,
    ]),
    MailsModule,
    CaslModule,
    CqrsModule,
  ],
  controllers: [],
  providers: [
    MailerConfig,
    MailOptionsBuilder,
    PostgresConfig,
    ScheduledTasksService,
    UsersService,
    DataCleanupService,
    KeyResolver,
    UsersRepo,
    UsersRawSqlRepository,
    CommentsRawSqlRepository,
    PostsRawSqlRepository,
    BloggerBlogsRawSqlRepository,
    InvalidJwtRepo,
    LikeStatusPostsRawSqlRepository,
    SecurityDevicesRepo,
    LikeStatusCommentsRawSqlRepository,
    BannedUsersForBlogsRawSqlRepository,
    SentCodeLogRepository,
  ],
})
export class SchedulingModule {}

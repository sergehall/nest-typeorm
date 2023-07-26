import { Module } from '@nestjs/common';
import { DemonsService } from './application/demons.service';
import { DemonsController } from './api/demons.controller';
import { demonsProviders } from './infrastructure/demons.providers';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { MailsModule } from '../mails/mails.module';
import { MailsRawSqlRepository } from '../mails/infrastructure/mails-raw-sql.repository';
import { UsersService } from '../users/application/users.service';
import { ConvertFiltersForDB } from '../common/convert-filters/convertFiltersForDB';
import { Pagination } from '../common/pagination/pagination';
import { CaslModule } from '../../ability/casl.module';
import { UsersRepository } from '../users/infrastructure/users.repository';
import { BlacklistJwtRepository } from '../auth/infrastructure/blacklist-jwt.repository';
import { CqrsModule } from '@nestjs/cqrs';
import { AddSentEmailTimeUseCase } from '../mails/application/use-cases/add-sent-email-time.use-case';
import { MailsAdapter } from '../mails/adapters/mails.adapter';
import { UsersRawSqlRepository } from '../users/infrastructure/users-raw-sql.repository';
import { BlacklistJwtRawSqlRepository } from '../auth/infrastructure/blacklist-jwt-raw-sql.repository';
import { SecurityDevicesRawSqlRepository } from '../security-devices/infrastructure/security-devices-raw-sql.repository';
import { DemonRemoveEmailConfirmCodeByIdUseCase } from '../mails/application/use-cases/remove-emai-confCode-byId.use-case';
import { DemonRemoveEmailRecoverCodeByIdUseCase } from '../mails/application/use-cases/remove-emai-recCode-byId.use-case';
import { SentEmailsTimeConfirmAndRecoverCodesRepository } from '../mails/infrastructure/sentEmailEmailsConfirmationCodeTime.repository';
import { LikeStatusPostsRawSqlRepository } from '../posts/infrastructure/like-status-posts-raw-sql.repository';
import { LikeStatusCommentsRawSqlRepository } from '../comments/infrastructure/like-status-comments-raw-sql.repository';
import { CommentsRawSqlRepository } from '../comments/infrastructure/comments-raw-sql.repository';
import { PostsRawSqlRepository } from '../posts/infrastructure/posts-raw-sql.repository';
import { BloggerBlogsRawSqlRepository } from '../blogger-blogs/infrastructure/blogger-blogs-raw-sql.repository';
import { BannedUsersForBlogsRawSqlRepository } from '../users/infrastructure/banned-users-for-blogs-raw-sql.repository';
import { DemonRemoveDataUsersWithExpiredDateUseCase } from './application/use-case/demon-delete-data-users-with-expired-date.use-case';

const demonsUseCases = [
  AddSentEmailTimeUseCase,
  DemonRemoveEmailConfirmCodeByIdUseCase,
  DemonRemoveEmailRecoverCodeByIdUseCase,
  DemonRemoveDataUsersWithExpiredDateUseCase,
];

@Module({
  imports: [DatabaseModule, MailsModule, CaslModule, CqrsModule],
  controllers: [DemonsController],
  providers: [
    MailsAdapter,
    DemonsService,
    MailsRawSqlRepository,
    UsersService,
    Pagination,
    ConvertFiltersForDB,
    UsersRepository,
    UsersRawSqlRepository,
    BlacklistJwtRepository,
    CommentsRawSqlRepository,
    PostsRawSqlRepository,
    BloggerBlogsRawSqlRepository,
    BlacklistJwtRawSqlRepository,
    LikeStatusPostsRawSqlRepository,
    SecurityDevicesRawSqlRepository,
    LikeStatusCommentsRawSqlRepository,
    BannedUsersForBlogsRawSqlRepository,
    SentEmailsTimeConfirmAndRecoverCodesRepository,
    ...demonsUseCases,
    ...demonsProviders,
  ],
})
export class DemonsModule {}

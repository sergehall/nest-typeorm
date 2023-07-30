import { Module } from '@nestjs/common';
import { UsersService } from '../users/application/users.service';
import { ConvertFiltersForDB } from '../common/convert-filters/convertFiltersForDB';
import { Pagination } from '../common/pagination/pagination';
import { UsersRepository } from '../users/infrastructure/users.repository';
import { MailsRawSqlRepository } from '../mails/infrastructure/mails-raw-sql.repository';
import { saProviders } from './infrastructure/sa.providers';
import { CaslModule } from '../../ability/casl.module';
import { BloggerBlogsService } from '../blogger-blogs/application/blogger-blogs.service';
import { PostsRepository } from '../posts/infrastructure/posts.repository';
import { LikeStatusPostsRepository } from '../posts/infrastructure/like-status-posts.repository';
import { SaController } from './api/sa.controller';
import { SaService } from './application/sa.service';
import { LikeStatusCommentsRepository } from '../comments/infrastructure/like-status-comments.repository';
import { BloggerBlogsRepository } from '../blogger-blogs/infrastructure/blogger-blogs.repository';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateUserByInstanceUseCase } from '../users/application/use-cases/create-user-byInstance.use-case';
import { SaChangeRoleUseCase } from './application/use-cases/sa-change-role.use-case';
import { SaBanUserByUserIdUseCase } from './application/use-cases/sa-ban-user.use-case';
import { UsersRawSqlRepository } from '../users/infrastructure/users-raw-sql.repository';
import { BloggerBlogsRawSqlRepository } from '../blogger-blogs/infrastructure/blogger-blogs-raw-sql.repository';
import { LikeStatusPostsRawSqlRepository } from '../posts/infrastructure/like-status-posts-raw-sql.repository';
import { SaBanBlogByBlogIUseCase } from './application/use-cases/sa-ban-blog-byBlogId.use-case';
import { SaBindBlogWithUserUseCase } from './application/use-cases/sa-bind-blog-with-user.use-case';
import { SaRemoveUserByUserIdUseCase } from './application/use-cases/sa-remove-user-byUserId.use-case';
import { LikeStatusCommentsRawSqlRepository } from '../comments/infrastructure/like-status-comments-raw-sql.repository';
import { CommentsRawSqlRepository } from '../comments/infrastructure/comments-raw-sql.repository';
import { PostsRawSqlRepository } from '../posts/infrastructure/posts-raw-sql.repository';
import { SecurityDevicesRawSqlRepository } from '../security-devices/infrastructure/security-devices-raw-sql.repository';
import { BannedUsersForBlogsRawSqlRepository } from '../users/infrastructure/banned-users-for-blogs-raw-sql.repository';
import { SentEmailsTimeConfirmAndRecoverCodesRepository } from '../mails/infrastructure/sentEmailEmailsConfirmationCodeTime.repository';
import { MongoConnectionModule } from '../../config/db/mongo/mongo-db.module';
import { ExpirationDateCalculator } from '../common/calculator/expiration-date-calculator';
import { EncryptConfig } from '../../config/encrypt/encrypt-config';

const saUseCases = [
  CreateUserByInstanceUseCase,
  SaChangeRoleUseCase,
  SaBanUserByUserIdUseCase,
  SaBanBlogByBlogIUseCase,
  SaBindBlogWithUserUseCase,
  SaRemoveUserByUserIdUseCase,
];

@Module({
  imports: [MongoConnectionModule, CaslModule, CqrsModule],
  controllers: [SaController],
  providers: [
    SaService,
    Pagination,
    UsersService,
    BloggerBlogsService,
    ConvertFiltersForDB,
    BloggerBlogsRepository,
    UsersRepository,
    EncryptConfig,
    MailsRawSqlRepository,
    PostsRepository,
    PostsRawSqlRepository,
    UsersRawSqlRepository,
    ExpirationDateCalculator,
    CommentsRawSqlRepository,
    LikeStatusPostsRepository,
    LikeStatusCommentsRepository,
    BloggerBlogsRawSqlRepository,
    LikeStatusPostsRawSqlRepository,
    SecurityDevicesRawSqlRepository,
    LikeStatusCommentsRawSqlRepository,
    BannedUsersForBlogsRawSqlRepository,
    SentEmailsTimeConfirmAndRecoverCodesRepository,
    ...saUseCases,
    ...saProviders,
  ],
})
export class SaModule {}

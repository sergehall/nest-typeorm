import { Module } from '@nestjs/common';
import { UsersService } from '../users/application/users.service';
import { MailsRawSqlRepository } from '../mails/infrastructure/mails-raw-sql.repository';
import { CaslModule } from '../../ability/casl.module';
import { BloggerBlogsService } from '../blogger-blogs/application/blogger-blogs.service';
import { SaController } from './api/sa.controller';
import { SaService } from './application/sa.service';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateUserUseCase } from '../users/application/use-cases/create-user.use-case';
import { SaChangeRoleUseCase } from './application/use-cases/sa-change-role.use-case';
import { UsersRawSqlRepository } from '../users/infrastructure/users-raw-sql.repository';
import { BloggerBlogsRawSqlRepository } from '../blogger-blogs/infrastructure/blogger-blogs-raw-sql.repository';
import { LikeStatusPostsRawSqlRepository } from '../posts/infrastructure/like-status-posts-raw-sql.repository';
import { SaRemoveUserByUserIdUseCase } from './application/use-cases/sa-remove-user-by-user-id.use-case';
import { LikeStatusCommentsRawSqlRepository } from '../comments/infrastructure/like-status-comments-raw-sql.repository';
import { CommentsRawSqlRepository } from '../comments/infrastructure/comments-raw-sql.repository';
import { PostsRawSqlRepository } from '../posts/infrastructure/posts-raw-sql.repository';
import { SecurityDevicesRawSqlRepository } from '../security-devices/infrastructure/security-devices-raw-sql.repository';
import { BannedUsersForBlogsRawSqlRepository } from '../users/infrastructure/banned-users-for-blogs-raw-sql.repository';
import { ExpirationDateCalculator } from '../common/calculator/expiration-date-calculator';
import { EncryptConfig } from '../../config/encrypt/encrypt-config';
import { SentEmailsTimeConfirmAndRecoverCodesRepository } from '../mails/infrastructure/sent-email-confirmation-code-time.repository';
import { ParseQueriesService } from '../common/query/parse-queries.service';
import { KeyArrayProcessor } from '../common/query/get-key-from-array-or-default';
import { SaBanUnbanBlogForUserUseCase } from './application/use-cases/sa-ban-unban-blog-for-user.use-case';
import { SaBanUnbanUserUseCase } from './application/use-cases/sa-ban-unban-user.use-case';
import { AddBannedUserToBanListUseCase } from './application/use-cases/old/add-banned-user-to-ban-list.use-case';
import { SaBanUserByUserIdUseCase } from './application/use-cases/old/sa-ban-user-by-user-id.use-case';
import { SaBanBlogByBlogIUseCase } from './application/use-cases/old/sa-ban-blog-by-blog-id.use-case';
import { SaBindBlogWithUserUseCase } from './application/use-cases/sa-bind-blog-with-user.use-case';
import { SaBindBlogWithUserByIdUseCase } from './application/use-cases/sa-bind-blog-with-user-by-id.use-case';

const saUseCases = [
  CreateUserUseCase,
  SaChangeRoleUseCase,
  SaRemoveUserByUserIdUseCase,
  SaBanUnbanBlogForUserUseCase,
  SaBanUnbanUserUseCase,
  AddBannedUserToBanListUseCase,
  SaBanUserByUserIdUseCase,
  SaBanBlogByBlogIUseCase,
  SaBindBlogWithUserByIdUseCase,
  SaBindBlogWithUserUseCase,
];

@Module({
  imports: [CaslModule, CqrsModule],
  controllers: [SaController],
  providers: [
    ParseQueriesService,
    SaService,
    UsersService,
    BloggerBlogsService,
    EncryptConfig,
    KeyArrayProcessor,
    MailsRawSqlRepository,
    PostsRawSqlRepository,
    UsersRawSqlRepository,
    ExpirationDateCalculator,
    CommentsRawSqlRepository,
    BloggerBlogsRawSqlRepository,
    LikeStatusPostsRawSqlRepository,
    SecurityDevicesRawSqlRepository,
    LikeStatusCommentsRawSqlRepository,
    BannedUsersForBlogsRawSqlRepository,
    SentEmailsTimeConfirmAndRecoverCodesRepository,
    ...saUseCases,
  ],
})
export class SaModule {}

import { Module } from '@nestjs/common';
import { DemonsService } from './application/demons.service';
import { MailsModule } from '../mails/mails.module';
import { MailsRawSqlRepository } from '../mails/infrastructure/mails-raw-sql.repository';
import { UsersService } from '../users/application/users.service';
import { CaslModule } from '../../ability/casl.module';
import { CqrsModule } from '@nestjs/cqrs';
import { MailsAdapter } from '../mails/adapters/mails.adapter';
import { UsersRawSqlRepository } from '../users/infrastructure/users-raw-sql.repository';
import { BlacklistJwtRawSqlRepository } from '../auth/infrastructure/blacklist-jwt-raw-sql.repository';
import { SecurityDevicesRawSqlRepository } from '../security-devices/infrastructure/security-devices-raw-sql.repository';
import { LikeStatusPostsRawSqlRepository } from '../posts/infrastructure/like-status-posts-raw-sql.repository';
import { LikeStatusCommentsRawSqlRepository } from '../comments/infrastructure/like-status-comments-raw-sql.repository';
import { CommentsRawSqlRepository } from '../comments/infrastructure/comments-raw-sql.repository';
import { PostsRawSqlRepository } from '../posts/infrastructure/posts-raw-sql.repository';
import { BloggerBlogsRawSqlRepository } from '../blogger-blogs/infrastructure/blogger-blogs-raw-sql.repository';
import { BannedUsersForBlogsRawSqlRepository } from '../users/infrastructure/banned-users-for-blogs-raw-sql.repository';
import { RemoveDataUsersWithExpiredDateUseCase } from './application/use-case/remove-data-users-with-expired-date.use-case';
import { MailerConfig } from '../../config/mailer/mailer-config';
import { PostgresConfig } from '../../config/db/postgres/postgres.config';
import { SentEmailsTimeConfirmAndRecoverCodesRepository } from '../mails/infrastructure/sent-email-confirmation-code-time.repository';
import { KeyArrayProcessor } from '../common/query/get-key-from-array-or-default';
import { FindAndSendConfirmationCodeUseCase } from '../mails/application/use-case/find-and-send-confirmation-code.use-case';
import { FindAndSendRecoveryCodeUseCase } from '../mails/application/use-case/find-and-send-recovery-code.use-case';
import { SendRecoveryCodesUseCase } from '../mails/adapters/use-case/send-recovery-codes';
import { SendRegistrationCodesUseCase } from '../mails/adapters/use-case/send-registration-codes.use-case';

const demonsUseCases = [
  RemoveDataUsersWithExpiredDateUseCase,
  FindAndSendConfirmationCodeUseCase,
  FindAndSendRecoveryCodeUseCase,
  SendRecoveryCodesUseCase,
  SendRegistrationCodesUseCase,
];

@Module({
  imports: [MailsModule, CaslModule, CqrsModule],
  controllers: [],
  providers: [
    MailsAdapter,
    MailerConfig,
    PostgresConfig,
    DemonsService,
    UsersService,
    KeyArrayProcessor,
    UsersRawSqlRepository,
    CommentsRawSqlRepository,
    PostsRawSqlRepository,
    MailsRawSqlRepository,
    BloggerBlogsRawSqlRepository,
    BlacklistJwtRawSqlRepository,
    LikeStatusPostsRawSqlRepository,
    SecurityDevicesRawSqlRepository,
    LikeStatusCommentsRawSqlRepository,
    BannedUsersForBlogsRawSqlRepository,
    SentEmailsTimeConfirmAndRecoverCodesRepository,
    ...demonsUseCases,
  ],
})
export class DemonsModule {}

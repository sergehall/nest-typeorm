import { Module } from '@nestjs/common';
import { MailsService } from './application/mails.service';
import { MailsRawSqlRepository } from './infrastructure/mails-raw-sql.repository';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailsAdapter } from './adapters/mails.adapter';
import { MailerConfig } from '../../config/mailer/mailer-config';
import { MailerOptionsService } from '../../config/mailer/mailer-options-service';
import { PostgresConfig } from '../../config/db/postgres/postgres.config';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useClass: MailerOptionsService, // Use the custom service for Mailer options
    }),
  ],
  providers: [
    MailerConfig,
    PostgresConfig,
    MailsService,
    MailsAdapter,
    MailsRawSqlRepository,
  ],
  exports: [MailsService],
})
export class MailsModule {}

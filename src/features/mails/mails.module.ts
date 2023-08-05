import { Module } from '@nestjs/common';
import { MailsService } from './application/mails.service';
import { MailsRawSqlRepository } from './infrastructure/mails-raw-sql.repository';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailsAdapter } from './adapters/mails.adapter';
import { SendRegistrationCodesUseCase } from './adapters/use-case/send-registration-codes.use-case';
import { SendRecoveryCodesUseCase } from './adapters/use-case/send-recovery-codes';
import { MailerConfig } from '../../config/mailer/mailer-config';
import { MailerOptionsService } from '../../config/mailer/mailer-options-service';
import { PostgresConfig } from '../../config/db/postgres/postgres.config';
import { KeyArrayProcessor } from '../common/query/get-key-from-array-or-default';

const mailsAdapterUseCases = [
  SendRegistrationCodesUseCase,
  SendRecoveryCodesUseCase,
];

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
    KeyArrayProcessor,
    MailsRawSqlRepository,
    ...mailsAdapterUseCases,
  ],
  exports: [MailsService],
})
export class MailsModule {}

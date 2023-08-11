import { Module } from '@nestjs/common';
import { MailsService } from './application/mails.service';
import { MailsRawSqlRepository } from './infrastructure/mails-raw-sql.repository';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailsAdapter } from './adapters/mails.adapter';
import { MailerConfig } from '../../config/mailer/mailer-config';
import { MailerOptionsService } from '../../config/mailer/mailer-options-service';
import { PostgresConfig } from '../../config/db/postgres/postgres.config';
import { SentEmailsTimeConfirmAndRecoverCodesRepository } from './infrastructure/sent-email-confirmation-code-time.repository';
import { CqrsModule } from '@nestjs/cqrs';
import { FindAndSendConfirmationCodeUseCase } from './application/use-case/find-and-send-confirmation-code.use-case';
import { FindAndSendRecoveryCodeUseCase } from './application/use-case/find-and-send-recovery-code.use-case';
import { SendRecoveryCodesUseCase } from './adapters/use-case/send-recovery-codes';
import { SendRegistrationCodesUseCase } from './adapters/use-case/send-registration-codes.use-case';

const mailsUseCases = [
  FindAndSendConfirmationCodeUseCase,
  FindAndSendRecoveryCodeUseCase,
  SendRegistrationCodesUseCase,
  SendRecoveryCodesUseCase,
];

@Module({
  imports: [
    MailerModule.forRootAsync({
      useClass: MailerOptionsService, // Use the custom service for Mailer options
    }),
    CqrsModule,
  ],
  providers: [
    MailerConfig,
    PostgresConfig,
    MailsService,
    MailsAdapter,
    MailsRawSqlRepository,
    SentEmailsTimeConfirmAndRecoverCodesRepository,
    ...mailsUseCases,
  ],
  exports: [MailsService],
})
export class MailsModule {}

import { Module } from '@nestjs/common';
import { MailsService } from './application/mails.service';
import { MailsRawSqlRepository } from './infrastructure/mails-raw-sql.repository';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailsAdapter } from './adapters/mails.adapter';
import { MailerConfig } from '../config/mailer/mailer-config';
import { MailerOptionsService } from '../config/mailer/mailer-options-service';
import { PostgresConfig } from '../config/db/postgres/postgres.config';
import { SentEmailsTimeConfirmAndRecoverCodesRepository } from './infrastructure/sent-email-confirmation-code-time.repository';
import { CqrsModule } from '@nestjs/cqrs';
import { FindAndSendRecoveryCodeUseCase } from './application/use-case/find-and-send-recovery-code.use-case';
import { SendRecoveryCodesUseCase } from './application/use-case/send-recovery-codes';
import { ClearSentEmailCodesUseCase } from './application/use-case/clear-sent-email-codes.use-case';
import { RegistrationSendCodeUseCase } from './application/use-case/send-codes.use-case';
import { EmailSendingUseCase } from './application/use-case/email-sending-use-case';

const mailsUseCases = [
  FindAndSendRecoveryCodeUseCase,
  EmailSendingUseCase,
  SendRecoveryCodesUseCase,
  ClearSentEmailCodesUseCase,
  RegistrationSendCodeUseCase,
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

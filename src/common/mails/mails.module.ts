import { Module } from '@nestjs/common';
import { MailsService } from './application/mails.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailerConfig } from '../../config/mailer/mailer-config';
import { PostgresConfig } from '../../config/db/postgres/postgres.config';
import { CqrsModule } from '@nestjs/cqrs';
import { EmailSendingUseCase } from './application/use-case/email-sending-use-case';
import { SendConfirmationCodesUseCase } from './application/use-case/send-confirmation-codes.use-case';
import { SendRecoveryCodesUseCase } from './application/use-case/send-recovery-codes.use-case';
import { MailOptionsBuilder } from './mail-options/mail-options-builder';
import { SentCodeLogRepo } from './infrastructure/sent-code-log.repo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SentCodesLogEntity } from './infrastructure/entities/sent-codes-log.entity';
import { NodemailerOptions } from './nodemailer/nodemailer-options';
import { SendConfirmationCodeWhenUserCreatedEventHandler } from './events-handlers/send-confirmation-code-when-user-created.event.handler';

const mailsUseCases = [
  EmailSendingUseCase,
  SendConfirmationCodesUseCase,
  SendRecoveryCodesUseCase,
];

const mailsEventHandlers = [SendConfirmationCodeWhenUserCreatedEventHandler];

@Module({
  imports: [
    TypeOrmModule.forFeature([SentCodesLogEntity]),
    CqrsModule,
    MailerModule.forRootAsync({
      useClass: NodemailerOptions, // Use the custom NodemailerOptions
    }),
  ],
  providers: [
    MailerConfig,
    PostgresConfig,
    MailOptionsBuilder,
    MailsService,
    SentCodeLogRepo,
    ...mailsEventHandlers,
    ...mailsUseCases,
  ],
  exports: [MailsService],
})
export class MailsModule {}

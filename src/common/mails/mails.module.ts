import { Module } from '@nestjs/common';
import { MailsService } from './application/mails.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { PostgresConfig } from '../../config/db/postgres/postgres.config';
import { CqrsModule } from '@nestjs/cqrs';
import { EmailSendingUseCase } from './application/use-case/email-sending-use-case';
import { SendConfirmationCodesUseCase } from './application/use-case/send-confirmation-codes.use-case';
import { SendRecoveryCodesUseCase } from './application/use-case/send-recovery-codes.use-case';
import { MailOptionsBuilder } from './mail-options/mail-options-builder';
import { SentCodeLogRepo } from './infrastructure/sent-code-log.repo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SentCodesLogEntity } from './entities/sent-codes-log.entity';
import { NodemailerOptions } from '../../config/nodemailer/nodemailer-options';
import { SendConfirmationCodeWhenRegistrationUserEventHandler } from './events-handlers/send-confirmation-code-when-registration-user.event.handler';
import { ReSendConfirmationCodeEventHandler } from './events-handlers/re-send-confirmation-code.event.handler';
import { SendRecoveryCodeEventHandler } from './events-handlers/send-recovery-code.event.handler';
import { MailsConfig } from '../../config/mails/mails.config';

const mailsUseCases = [
  EmailSendingUseCase,
  SendConfirmationCodesUseCase,
  SendRecoveryCodesUseCase,
];

const mailsEventHandlers = [
  SendRecoveryCodeEventHandler,
  ReSendConfirmationCodeEventHandler,
  SendConfirmationCodeWhenRegistrationUserEventHandler,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([SentCodesLogEntity]),
    CqrsModule,
    MailerModule.forRootAsync({
      useClass: NodemailerOptions, // Use the custom NodemailerOptions
    }),
  ],
  providers: [
    MailsConfig,
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

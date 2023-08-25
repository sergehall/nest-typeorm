import { Module } from '@nestjs/common';
import { MailsService } from './application/mails.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailerConfig } from '../config/mailer/mailer-config';
import { MailerOptionsService } from '../config/mailer/mailer-options-service';
import { PostgresConfig } from '../config/db/postgres/postgres.config';
import { CqrsModule } from '@nestjs/cqrs';
import { EmailSendingUseCase } from './application/use-case/email-sending-use-case';
import { SendConfirmationCodesUseCase } from './application/use-case/send-confirmation-codes.use-case';
import { SendRecoveryCodesUseCase } from './application/use-case/send-recovery-codes.use-case';
import { SentCodeLogRepository } from './infrastructure/sent-code-log.repository';
import { MailOptionsBuilder } from './mail-options/mail-options-builder';
import { SentCodeLogRepo } from './infrastructure/sent-code-log.repo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SentCodesLogEntity } from './infrastructure/entities/sent-codes-log.entity';

const mailsUseCases = [
  EmailSendingUseCase,
  SendConfirmationCodesUseCase,
  SendRecoveryCodesUseCase,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([SentCodesLogEntity]),
    CqrsModule,
    MailerModule.forRootAsync({
      useClass: MailerOptionsService, // Use the custom service for Mailer options
    }),
  ],
  providers: [
    MailerConfig,
    PostgresConfig,
    MailsService,
    MailOptionsBuilder,
    SentCodeLogRepo,
    SentCodeLogRepository,
    ...mailsUseCases,
  ],
  exports: [MailsService],
})
export class MailsModule {}

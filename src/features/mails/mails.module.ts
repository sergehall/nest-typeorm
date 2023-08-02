import { Module } from '@nestjs/common';
import { MailsService } from './application/mails.service';
import { mailsProviders } from './infrastructure/mails.provaiders';
import { MailsRawSqlRepository } from './infrastructure/mails-raw-sql.repository';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailsAdapter } from './adapters/mails.adapter';
import { SendRegistrationCodesUseCase } from './adapters/use-case/send-registration-codes.use-case';
import { SendRecoveryCodesUseCase } from './adapters/use-case/send-recovery-codes';
import { MongoConnectionModule } from '../../config/db/mongo/mongo-db.module';
import { MailerConfig } from '../../config/mailer/mailer-config';
import { MailerOptionsService } from '../../config/mailer/mailer-options-service';

const mailsAdapterUseCases = [
  SendRegistrationCodesUseCase,
  SendRecoveryCodesUseCase,
];

@Module({
  imports: [
    MongoConnectionModule,
    MailerModule.forRootAsync({
      useClass: MailerOptionsService, // Use the custom service for Mailer options
    }),
  ],
  providers: [
    MailerConfig,
    MailsService,
    MailsAdapter,
    MailsRawSqlRepository,
    ...mailsAdapterUseCases,
    ...mailsProviders,
  ],
  exports: [MailsService],
})
export class MailsModule {}

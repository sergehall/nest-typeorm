import { Module } from '@nestjs/common';
import { MailsService } from './application/mails.service';
import { mailsProviders } from './infrastructure/mails.provaiders';
import { MailsRawSqlRepository } from './infrastructure/mails-raw-sql.repository';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailsAdapter } from './adapters/mails.adapter';
import Configuration from '../../config/configuration';
import { SendRegistrationCodesUseCase } from './adapters/use-case/send-registrationCodes.use-case';
import { SendRecoveryCodesUseCase } from './adapters/use-case/send-recoveryCodes';
import { MongoConnectionModule } from '../../config/db/mongo/mongo-db.module';

const mailsAdapterUseCases = [
  SendRegistrationCodesUseCase,
  SendRecoveryCodesUseCase,
];

@Module({
  imports: [
    MongoConnectionModule,
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: Configuration.getConfiguration().mailConfig.MAIL_HOST,
          port: Configuration.getConfiguration().mailConfig.EMAIL_PORT,
          ignoreTLS: true,
          secure: true,
          auth: {
            user: Configuration.getConfiguration().mailConfig.NODEMAILER_EMAIL,
            pass: Configuration.getConfiguration().mailConfig
              .NODEMAILER_APP_PASSWORD,
          },
        },
        defaults: {
          from: '"No Reply" <noreply@example.com>',
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  providers: [
    MailsService,
    MailsRawSqlRepository,
    MailsAdapter,
    ...mailsAdapterUseCases,
    ...mailsProviders,
  ],
  exports: [MailsService],
})
export class MailsModule {}

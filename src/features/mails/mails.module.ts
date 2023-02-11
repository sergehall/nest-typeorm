import { Module } from '@nestjs/common';
import { MailsService } from './application/mails.service';
import { mailsProviders } from './infrastructure/mails.provaiders';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { MailsRepository } from './infrastructure/mails.repository';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailsAdapter } from './adapters/mails.adapter';
import { getConfiguration } from '../../config/configuration';
import { SendCodeByRegistrationUseCase } from './adapters/use-case/send-code-by-registration.use-case';

const mailsAdapterUseCases = [SendCodeByRegistrationUseCase];

@Module({
  imports: [
    DatabaseModule,
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: getConfiguration().mail.MAIL_HOST,
          port: getConfiguration().mail.EMAIL_PORT,
          ignoreTLS: true,
          secure: true,
          auth: {
            user: getConfiguration().mail.NODEMAILER_EMAIL,
            pass: getConfiguration().mail.NODEMAILER_APP_PASSWORD,
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
    MailsRepository,
    MailsAdapter,
    ...mailsAdapterUseCases,
    ...mailsProviders,
  ],
  exports: [MailsService],
})
export class MailsModule {}

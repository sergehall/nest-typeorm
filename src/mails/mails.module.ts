import { Module } from '@nestjs/common';
import { MailsService } from './mails.service';
import { mailsProviders } from './infrastructure/mails.provaiders';
import { DatabaseModule } from '../infrastructure/database/database.module';
import { MailsRepository } from './infrastructure/mails.repository';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailsAdapter } from './adapters/mails.adapter';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get('MAIL_HOST'),
          port: configService.get('EMAIL_PORT'),
          ignoreTLS: true,
          secure: true,
          auth: {
            user: configService.get('NODEMAILER_EMAIL'),
            pass: configService.get('NODEMAILER_APP_PASSWORD'),
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
      inject: [ConfigService],
    }),
  ],
  providers: [MailsService, MailsRepository, MailsAdapter, ...mailsProviders],
  exports: [MailsService],
})
export class MailsModule {}

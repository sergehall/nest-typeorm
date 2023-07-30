import { Injectable } from '@nestjs/common';
import { MailerOptions, MailerOptionsFactory } from '@nestjs-modules/mailer';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from '../configuration';

@Injectable()
export class MailerOptionsService implements MailerOptionsFactory {
  constructor(protected configService: ConfigService<ConfigType, true>) {}

  createMailerOptions(): MailerOptions {
    const { MAIL_HOST, EMAIL_PORT, NODEMAILER_EMAIL, NODEMAILER_APP_PASSWORD } =
      this.configService.get('mail');
    return {
      transport: {
        host: MAIL_HOST,
        port: EMAIL_PORT,
        ignoreTLS: true,
        secure: true,
        auth: {
          user: NODEMAILER_EMAIL,
          pass: NODEMAILER_APP_PASSWORD,
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
    };
  }
}

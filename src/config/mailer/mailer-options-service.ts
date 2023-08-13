import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { MailerOptions, MailerOptionsFactory } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailerConfig } from './mailer-config';

@Injectable()
export class MailerOptionsService
  extends MailerConfig
  implements MailerOptionsFactory
{
  async createMailerOptions(): Promise<MailerOptions> {
    const host = await this.getNodeMailer('MAIL_HOST');
    const port = await this.getMailerPort('EMAIL_PORT');
    const user = await this.getNodeMailer('NODEMAILER_EMAIL');
    const pass = await this.getNodeMailer('NODEMAILER_APP_PASSWORD');

    return {
      transport: {
        host: host,
        port: port,
        ignoreTLS: true,
        secure: true,
        auth: {
          user: user,
          pass: pass,
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

import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { MailerOptions, MailerOptionsFactory } from '@nestjs-modules/mailer';
import { MailsConfig } from '../mails/mails.config';

@Injectable()
export class NodemailerOptions
  extends MailsConfig
  implements MailerOptionsFactory
{
  async createMailerOptions(): Promise<MailerOptions> {
    const host: string = await this.getMailsConfig('MAIL_HOST');
    const port: number = await this.getMailsPort('EMAIL_PORT');
    const user: string = await this.getMailsConfig('NODEMAILER_EMAIL');
    const pass: string = await this.getMailsConfig('NODEMAILER_APP_PASSWORD');

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
        // adapters: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    };
  }
}

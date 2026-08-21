import { Injectable } from '@nestjs/common';
import nodemailer, { type Transporter } from 'nodemailer';
import { MailsConfig } from '../mails/mails.config';

export const NODEMAILER_TRANSPORT = Symbol('NODEMAILER_TRANSPORT');

@Injectable()
export class NodemailerOptions extends MailsConfig {
  async createTransport(): Promise<Transporter> {
    const host: string = await this.getMailsConfig('MAIL_HOST');
    const port: number = await this.getMailsPort('EMAIL_PORT');
    const user: string = await this.getMailsConfig('NODEMAILER_EMAIL');
    const pass: string = await this.getMailsConfig('NODEMAILER_APP_PASSWORD');

    return nodemailer.createTransport(
      {
        host: host,
        port: port,
        secure: port === 465,
        auth: {
          user: user,
          pass: pass,
        },
      },
      {
        from: '"No Reply" <noreply@example.com>',
      },
    );
  }
}

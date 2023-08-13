import { Injectable } from '@nestjs/common';
import { MailerConfig } from '../../config/mailer/mailer-config';
import { PostgresConfig } from '../../config/db/postgres/postgres.config';
import { ConfirmationCodeEmailOptions } from '../application/dto/confirmation-code-email-options';

@Injectable()
export class MailOptionsBuilder {
  constructor(
    protected mailerConfig: MailerConfig,
    protected postgresConfig: PostgresConfig,
  ) {}

  async buildOptionsForRecoveryCode(
    email: string,
    recoveryCode: string,
  ): Promise<ConfirmationCodeEmailOptions> {
    const domainName = await this.postgresConfig.getDomain('PG_DOMAIN_HEROKU');
    const fromEmail = await this.mailerConfig.getNodeMailer('NODEMAILER_EMAIL');
    const path = '/auth/password-recovery';
    const parameter = '?recoveryCode=' + recoveryCode;
    const fullURL = domainName + path + parameter;
    const subject = 'Your Recovery Code for Account Access';
    const template = 'index';
    const text = 'Welcome';
    const html = `
      <h1 style="color: dimgrey">Your Recovery Code for Account Access</h1><p>Did you forget your password? Use the recovery code provided below to reset your password and regain access to your account.</p><p><a style="font-size: 20px; text-decoration-line: underline" href=${fullURL}>Click here to reset your password</a></p>`;

    const context = {
      name: email,
      fullURL,
    };

    return {
      to: email,
      from: fromEmail,
      subject,
      template,
      text,
      html,
      context,
    };
  }

  async buildOptionsForConfirmationCode(
    email: string,
    confirmationCode: string,
  ): Promise<ConfirmationCodeEmailOptions> {
    const fromEmail = await this.mailerConfig.getNodeMailer('NODEMAILER_EMAIL');
    const domainName = await this.postgresConfig.getDomain('PG_DOMAIN_HEROKU');
    const path = '/auth/confirm-registration';
    const parameter = '?code=' + confirmationCode;
    const fullURL = domainName + path + parameter;
    const subject = 'Welcome to Our Community! Confirm Your Email Registration';
    const template = 'index';
    const text = 'Welcome';
    const html = `
      <h1 style="color: dimgrey">Your registration is almost complete!</h1><p>We're excited to have you on board. To access your account, please confirm your email address by clicking the link below.</p><p><a style="font-size: 20px; text-decoration-line: underline" href=${fullURL}>Confirm your email now</a></p>`;

    const context = {
      name: email,
      fullURL,
    };

    return {
      to: email,
      from: fromEmail,
      subject,
      template,
      text,
      html,
      context,
    };
  }
}

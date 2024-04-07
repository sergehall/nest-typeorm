import { Injectable } from '@nestjs/common';

import { PostgresConfig } from '../../../config/db/postgres/postgres.config';
import { ConfirmationCodeEmailOptions } from '../application/dto/confirmation-code-email-options';
import { MailsConfig } from '../../../config/mails/mails.config';
import { UsersEntity } from '../../../features/users/entities/users.entity';

@Injectable()
export class MailOptionsBuilder {
  private domainName: string;
  private fromEmail: string;
  constructor(
    protected mailsConfig: MailsConfig,
    protected postgresConfig: PostgresConfig,
  ) {
    this.initializeDomainName().then();
    this.initializeFromEmail().then();
  }

  private async buildOptions(
    fullURL: string,
    user: UsersEntity,
    subject: string,
    emailText: string,
    htmlText: string,
  ): Promise<ConfirmationCodeEmailOptions> {
    const { email } = user;
    const fromEmail = this.fromEmail;

    const context = {
      name: email,
      fullURL,
    };

    return {
      to: email,
      from: fromEmail,
      subject,
      template: 'index',
      text: emailText,
      html: htmlText,
      context,
    };
  }

  async buildOptionsForRecoveryCode(
    user: UsersEntity,
  ): Promise<ConfirmationCodeEmailOptions> {
    const domainName = this.domainName;
    const path = '/auth/password-recovery';
    const parameter = `?recoveryCode=${user.confirmationCode}`;
    const fullURL = domainName + path + parameter;
    const subject = 'Your Recovery Code for Account Access';
    const emailText = 'Welcome';
    const htmlText = `
      <h1 style="color: dimgrey">Your Recovery Code for Account Access</h1>
      <p>Did you forget your password? Use the recovery code provided below to reset your password and regain access to your account.</p>
      <p><a style="font-size: 20px; text-decoration-line: underline" href="${fullURL}">Click here to reset your password</a></p>`;

    return this.buildOptions(fullURL, user, subject, emailText, htmlText);
  }

  async buildOptionsForConfirmationCode(
    user: UsersEntity,
  ): Promise<ConfirmationCodeEmailOptions> {
    const domainName = this.domainName;
    const path = '/auth/confirm-registration';
    const parameter = `?code=${user.confirmationCode}`;
    const fullURL = domainName + path + parameter;
    const subject = 'Welcome to Our Community! Confirm Your Email Registration';
    const emailText = 'Welcome';
    const htmlText = `
      <h1 style="color: dimgrey">Your registration is almost complete!</h1>
      <p>We're excited to have you on board. To access your account, please confirm your email address by clicking the link below.</p>
      <p><a style="font-size: 20px; text-decoration-line: underline" href="${fullURL}">Confirm your email now</a></p>`;

    return this.buildOptions(fullURL, user, subject, emailText, htmlText);
  }

  private async initializeDomainName(): Promise<void> {
    this.domainName =
      await this.postgresConfig.getPostgresConfig('PG_DOMAIN_HEROKU');
  }

  private async initializeFromEmail(): Promise<void> {
    this.fromEmail = await this.mailsConfig.getMailsConfig('NODEMAILER_EMAIL');
  }
}

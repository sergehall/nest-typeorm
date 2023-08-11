import { Injectable } from '@nestjs/common';
import { MailerConfig } from '../../../config/mailer/mailer-config';
import { PostgresConfig } from '../../../config/db/postgres/postgres.config';

@Injectable()
export class MailsAdapter {
  constructor(
    protected mailerConfig: MailerConfig,
    protected postgresConfig: PostgresConfig,
  ) {}

  async createSendMailOptionsForRecoveryCode(
    email: string,
    recoveryCode: string,
  ) {
    const domainName = await this.postgresConfig.getDomain('PG_DOMAIN_HEROKU');
    const fromEmail = await this.mailerConfig.getNodeMailerValue(
      'NODEMAILER_EMAIL',
    );
    const path = '/auth/password-recovery';
    const parameter = '?recoveryCode=' + recoveryCode;
    const fullURL = domainName + path + parameter;
    const subject = 'Recovery code';
    const template = 'index';
    const text = 'Welcome';
    const html = `
      <h1 style="color: dimgrey">Click on the link below to confirm your email address.</h1>
      <div><a style="font-size: 20px; text-decoration-line: underline" href=${fullURL}> Push link to confirm email.</a></div>`;

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

  async createSendMailOptionsForConfirmationCode(
    email: string,
    confirmationCode: string,
  ) {
    const nodemailerEmail = await this.mailerConfig.getNodeMailerValue(
      'NODEMAILER_EMAIL',
    );
    const domainName = await this.postgresConfig.getDomain('PG_DOMAIN_HEROKU');
    const path = '/auth/confirm-registration';
    const parameter = '?code=' + confirmationCode;
    const fullURL = domainName + path + parameter;
    const fromEmail = nodemailerEmail;
    const subject = 'Registration by confirmation code';
    const template = 'index';
    const text = 'Welcome';
    const html = `
      <h1 style="color: dimgrey">Click on the link below to confirm your email address.</h1>
      <div><a style="font-size: 20px; text-decoration-line: underline" href=${fullURL}> Push link to confirm email.</a></div>`;

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

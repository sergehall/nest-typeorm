import { Injectable } from '@nestjs/common';
import { EmailConfimCodeEntity } from '../entities/email-confim-code.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { DomainNamesEnums } from '../enums/domain-names.enums';

@Injectable()
export class MailsAdapter {
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}
  async sendCodeByRegistration(
    emailAndCode: EmailConfimCodeEntity,
  ): Promise<void> {
    const domainName = DomainNamesEnums.NEST_API_URL;
    const path = '/auth/confirm-registration';
    const parameter = '?code=' + emailAndCode.confirmationCode;
    const fullURL = domainName + path + parameter;
    await this.mailerService
      .sendMail({
        to: emailAndCode.email,
        from: this.configService.get('mail.NODEMAILER_EMAIL'),
        subject: 'Registration by confirmation code',
        template: 'index',
        text: 'Welcome', // plaintext body
        html: `
      <h1 style="color: dimgrey">Click on the link below to confirm your email address.</h1>
       <div><a style="font-size: 20px; text-decoration-line: underline" href=${fullURL}> Push link to confirm email.</a></div>`,
        context: {
          name: emailAndCode.createdAt,
          fullURL,
        },
      })
      .then((success) => {
        console.log(success);
      })
      .catch((err) => {
        console.log(err);
      });
  }
}

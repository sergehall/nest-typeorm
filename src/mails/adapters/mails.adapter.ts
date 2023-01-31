import { Injectable } from '@nestjs/common';
import { EmailConfimCodeEntity } from '../entities/email-confim-code.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { DomainNamesEnums } from '../../infrastructure/database/enums/domain-names.enums';

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
        from: this.configService.get('NODEMAILER_EMAIL'),
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

  // async sendCodeByPasswordRecovery(emailAndCode: MailsRecoveryCodeDto) {
  //   return await transporter.sendMail({
  //     from: 'Serge Nodemailer <ck.NODEMAILER_EMAIL>',
  //     to: emailAndCode.email,
  //     subject: 'Password recovery by recoveryCode',
  //     html: `
  //       <h1>Password recovery</h1>
  //         <p>To finish password recovery please follow the link below:
  //         <div><a style="font-size: 20px; text-decoration-line: underline" href=\"https://it-express-api.herokuapp.com/auth/password-recovery?recoveryCode=${emailAndCode.recoveryCode}\"> Push for recovery password </a></div>
  //       </p>
  //       `,
  //   });
  // }
  //
  // async sendCodeByRecoveryPassword(user: User, token: string) {
  //   return await transporter.sendMail({
  //     from: 'Serge Nodemailer <ck.NODEMAILER_EMAIL>',
  //     to: user.email,
  //     subject: 'Recover password',
  //     html: `
  //       Hello, to recover your password, please enter the following link:
  //       <div><a style="font-size: 20px; text-decoration-line: underline" href=\"https://it-express-api.herokuapp.com/auth/resend-registration-email?code=${token}\">code </a></div>
  //       `,
  //   });
  // }
  //
  // async sendEmail(email: string, subject: string, text: string) {
  //   return await transporter.sendMail({
  //     from: 'Serge Nodemailer <ck.NODEMAILER_EMAIL>',
  //     to: email,
  //     subject: subject,
  //     html: text,
  //   });
  // }
}

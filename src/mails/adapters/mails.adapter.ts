import { Injectable } from '@nestjs/common';
import { EmailConfimCodeEntity } from '../entities/email-confim-code.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailsAdapter {
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}
  async sendCodeByRegistration(
    emailAndCode: EmailConfimCodeEntity,
  ): Promise<void> {
    const appUrl = this.configService.get('appUrl.NEST_API_URL');
    const URL = `${appUrl} + /auth/confirm-registration?code=${emailAndCode.confirmationCode}`;
    await this.mailerService
      .sendMail({
        to: emailAndCode.email,
        from: this.configService.get('mail.NODEMAILER_EMAIL'),
        subject: 'Registration by confirmation code',
        template: 'index',
        text: 'welcome', // plaintext body
        html: `
      <h1 style="color: dimgrey">Click on the link below to confirm your email address</h1>
       <div><a style="font-size: 20px; text-decoration-line: underline" href=\"https://it-express-api.herokuapp.com/auth/confirm-registration?code=${emailAndCode.confirmationCode}\"> Push to confirm. /registration-confirmation?code=${emailAndCode.confirmationCode}</a></div>
      `,
        context: {
          name: emailAndCode.createdAt,
          URL,
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
  //       <div><a style="font-size: 20px; text-decoration-line: underline" href=\"https://it-express-api.herokuapp.com/auth/resend-registration-email?code=${token}\"> сode </a></div>
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

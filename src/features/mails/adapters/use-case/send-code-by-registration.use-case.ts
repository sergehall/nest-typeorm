import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { EmailConfimCodeEntity } from '../../entities/email-confim-code.entity';
import { DomainNamesEnums } from '../../enums/domain-names.enums';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class SendCodeByRegistrationCommand {
  constructor(public emailAndCode: EmailConfimCodeEntity) {}
}
@CommandHandler(SendCodeByRegistrationCommand)
export class SendCodeByRegistrationUseCase
  implements ICommandHandler<SendCodeByRegistrationCommand>
{
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}
  async execute(command: SendCodeByRegistrationCommand): Promise<void> {
    const domainName = DomainNamesEnums.NEST_RAQ_SQL_URL;
    const path = '/auth/confirm-registration';
    const parameter = '?code=' + command.emailAndCode.confirmationCode;
    const fullURL = domainName + path + parameter;
    await this.mailerService
      .sendMail({
        to: command.emailAndCode.email,
        from: this.configService.get('mail.NODEMAILER_EMAIL'),
        subject: 'Registration by confirmation code',
        template: 'index',
        text: 'Welcome', // plaintext body
        html: `
      <h1 style="color: dimgrey">Click on the link below to confirm your email address.</h1>
       <div><a style="font-size: 20px; text-decoration-line: underline" href=${fullURL}> Push link to confirm email.</a></div>`,
        context: {
          name: command.emailAndCode.createdAt,
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

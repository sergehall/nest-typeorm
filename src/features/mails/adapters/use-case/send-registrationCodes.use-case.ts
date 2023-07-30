import { MailerService } from '@nestjs-modules/mailer';
import { DomainNamesEnums } from '../../enums/domain-names.enums';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EmailsConfirmCodeEntity } from '../../../demons/entities/emailsConfirmCode.entity';
import { MailerConfig } from '../../../../config/mailer/mailer-config';

export class SendRegistrationCodesCommand {
  constructor(public emailAndCode: EmailsConfirmCodeEntity) {}
}
@CommandHandler(SendRegistrationCodesCommand)
export class SendRegistrationCodesUseCase
  implements ICommandHandler<SendRegistrationCodesCommand>
{
  constructor(
    private mailerService: MailerService,
    protected mailerConfig: MailerConfig,
  ) {}

  async execute(command: SendRegistrationCodesCommand): Promise<void> {
    const EMAIL_FROM = this.mailerConfig.getNodeMailerEmail('NODEMAILER_EMAIL');
    const { email, confirmationCode } = command.emailAndCode;
    const domainName = DomainNamesEnums.NEST_RAQ_SQL_URL;
    const path = '/auth/confirm-registration';
    const parameter = '?code=' + confirmationCode;
    const fullURL = domainName + path + parameter;
    const fromEmail = EMAIL_FROM;
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

    try {
      const success = await this.mailerService.sendMail({
        to: email,
        from: fromEmail,
        subject,
        template,
        text,
        html,
        context,
      });
      console.log(success);
    } catch (error) {
      console.log(error);
    }
  }
}

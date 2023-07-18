import { MailerService } from '@nestjs-modules/mailer';
import { DomainNamesEnums } from '../../enums/domain-names.enums';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { getConfiguration } from '../../../../config/configuration';
import { EmailsRecoveryCodesEntity } from '../../../demons/entities/emailsRecoveryCodes.entity';

export class SendRecoveryCodesCommand {
  constructor(public emailAndCode: EmailsRecoveryCodesEntity) {}
}

@CommandHandler(SendRecoveryCodesCommand)
export class SendRecoveryCodesUseCase
  implements ICommandHandler<SendRecoveryCodesCommand>
{
  constructor(private mailerService: MailerService) {}

  async execute(command: SendRecoveryCodesCommand): Promise<void> {
    const { email, recoveryCode } = command.emailAndCode;
    const domainName = DomainNamesEnums.NEST_RAQ_SQL_URL;
    const path = '/auth/password-recovery';
    const parameter = '?recoveryCode=' + recoveryCode;
    const fullURL = domainName + path + parameter;

    const fromEmail = getConfiguration().mail.NODEMAILER_EMAIL;
    const subject = 'Sent recovery code';
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

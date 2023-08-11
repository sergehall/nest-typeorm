import { MailerService } from '@nestjs-modules/mailer';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MailsAdapter } from '../../adapters/mails.adapter';
import { EmailsConfirmCodeEntity } from '../../entities/emails-confirm-code.entity';

export class SendRegistrationCodesCommand {
  constructor(public emailAndCode: EmailsConfirmCodeEntity) {}
}
@CommandHandler(SendRegistrationCodesCommand)
export class SendRegistrationCodesUseCase
  implements ICommandHandler<SendRegistrationCodesCommand>
{
  constructor(
    protected mailsAdapter: MailsAdapter,
    private mailerService: MailerService,
  ) {}

  async execute(command: SendRegistrationCodesCommand): Promise<boolean> {
    const { email, confirmationCode } = command.emailAndCode;

    const sendMailOptions =
      await this.mailsAdapter.createSendMailOptionsForConfirmationCode(
        email,
        confirmationCode,
      );

    try {
      const success = await this.mailerService.sendMail(sendMailOptions);
      console.log(success);
      return true; // Email sent successfully
    } catch (error) {
      console.log(error);
      return false; // Error occurred while sending email
    }
  }
}

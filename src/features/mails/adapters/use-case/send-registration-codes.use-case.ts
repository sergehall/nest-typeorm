import { MailerService } from '@nestjs-modules/mailer';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MailsAdapter } from '../mails.adapter';
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

  async execute(command: SendRegistrationCodesCommand): Promise<void> {
    const { email, confirmationCode } = command.emailAndCode;

    const sendMailOptions =
      await this.mailsAdapter.createSendMailOptionsForConfirmationCode(
        email,
        confirmationCode,
      );

    try {
      const success = await this.mailerService.sendMail(sendMailOptions);
      console.log(success);
    } catch (error) {
      console.log(error);
    }
  }
}

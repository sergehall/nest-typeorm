import { MailerService } from '@nestjs-modules/mailer';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConfirmationCodeEmailOptions } from '../dto/confirmation-code-email-options';

export class EmailSendingCommand {
  constructor(public sendMailOptions: ConfirmationCodeEmailOptions) {}
}

@CommandHandler(EmailSendingCommand)
export class EmailSendingUseCase
  implements ICommandHandler<EmailSendingCommand>
{
  constructor(protected mailerService: MailerService) {}

  async execute(command: EmailSendingCommand): Promise<boolean> {
    const { sendMailOptions } = command;
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

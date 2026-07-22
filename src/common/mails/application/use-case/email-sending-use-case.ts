import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { type Transporter } from 'nodemailer';
import { NODEMAILER_TRANSPORT } from '../../../../config/nodemailer/nodemailer-options';
import { ConfirmationCodeEmailOptions } from '../dto/confirmation-code-email-options';

export class EmailSendingCommand {
  constructor(public sendMailOptions: ConfirmationCodeEmailOptions) {}
}

@CommandHandler(EmailSendingCommand)
export class EmailSendingUseCase implements ICommandHandler<EmailSendingCommand> {
  constructor(
    @Inject(NODEMAILER_TRANSPORT)
    protected readonly mailTransport: Transporter,
  ) {}

  async execute(command: EmailSendingCommand): Promise<boolean> {
    const { sendMailOptions } = command;
    try {
      const success = await this.mailTransport.sendMail(sendMailOptions);
      console.log(success);
      return true; // Email sent successfully
    } catch (error) {
      console.log(error);
      return false; // Error occurred while sending email
    }
  }
}

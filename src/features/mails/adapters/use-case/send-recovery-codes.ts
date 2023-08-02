import { MailerService } from '@nestjs-modules/mailer';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EmailsRecoveryCodesEntity } from '../../../demons/entities/emailsRecoveryCodes.entity';
import { MailsAdapter } from '../mails.adapter';

export class SendRecoveryCodesCommand {
  constructor(public emailAndCode: EmailsRecoveryCodesEntity) {}
}

@CommandHandler(SendRecoveryCodesCommand)
export class SendRecoveryCodesUseCase
  implements ICommandHandler<SendRecoveryCodesCommand>
{
  constructor(
    protected mailsAdapter: MailsAdapter,
    protected mailerService: MailerService,
  ) {}

  async execute(command: SendRecoveryCodesCommand): Promise<void> {
    const { email, recoveryCode } = command.emailAndCode;

    const sendMailOptions =
      await this.mailsAdapter.createSendMailOptionsForRecoveryCode(
        email,
        recoveryCode,
      );

    try {
      const success = await this.mailerService.sendMail(sendMailOptions);
      console.log(success);
    } catch (error) {
      console.log(error);
    }
  }
}

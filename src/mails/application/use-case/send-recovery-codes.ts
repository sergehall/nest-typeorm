import { MailerService } from '@nestjs-modules/mailer';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MailsAdapter } from '../../adapters/mails.adapter';
import { EmailsRecoveryCodesEntity } from '../../entities/emails-recovery-codes.entity';

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

  async execute(command: SendRecoveryCodesCommand): Promise<boolean> {
    const { email, recoveryCode } = command.emailAndCode;

    const sendMailOptions =
      await this.mailsAdapter.buildMailOptionsForRecoveryCode(
        email,
        recoveryCode,
      );

    try {
      const success = await this.mailerService.sendMail(sendMailOptions);
      console.log(success);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}

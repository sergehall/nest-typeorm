import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SentEmailsTimeConfirmAndRecoverCodesRepository } from '../../infrastructure/sent-email-confirmation-code-time.repository';
import { MailsAdapter } from '../../adapters/mails.adapter';
import { EmailSendingCommand } from './email-sending-use-case';

export class SendRecoveryCodesCommand {
  constructor(public email: string, public recoveryCode: string) {}
}

@CommandHandler(SendRecoveryCodesCommand)
export class SendRecoveryCodesUseCase
  implements ICommandHandler<SendRecoveryCodesCommand>
{
  constructor(
    protected commandBus: CommandBus,
    protected mailsAdapter: MailsAdapter,
    protected sentEmailsTimeRepository: SentEmailsTimeConfirmAndRecoverCodesRepository,
  ) {}

  async execute(command: SendRecoveryCodesCommand): Promise<void> {
    const { email, recoveryCode } = command;

    const mailOptions = await this.mailsAdapter.buildMailOptionsForRecoveryCode(
      email,
      recoveryCode,
    );

    await this.commandBus.execute(new EmailSendingCommand(mailOptions));

    await this.sentEmailsTimeRepository.addConfirmationCode(email);
  }
}

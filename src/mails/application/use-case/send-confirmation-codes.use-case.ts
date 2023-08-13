import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SentEmailsTimeConfirmAndRecoverCodesRepository } from '../../infrastructure/sent-email-confirmation-code-time.repository';
import { MailsAdapter } from '../../adapters/mails.adapter';
import { EmailSendingCommand } from './email-sending-use-case';

export class SendConfirmationCodesCommand {
  constructor(public email: string, public confirmationCode: string) {}
}

@CommandHandler(SendConfirmationCodesCommand)
export class SendConfirmationCodesUseCase
  implements ICommandHandler<SendConfirmationCodesCommand>
{
  constructor(
    protected commandBus: CommandBus,
    protected mailsAdapter: MailsAdapter,
    protected sentEmailsTimeRepository: SentEmailsTimeConfirmAndRecoverCodesRepository,
  ) {}

  async execute(command: SendConfirmationCodesCommand): Promise<void> {
    const { email, confirmationCode } = command;

    const mailOptions =
      await this.mailsAdapter.buildMailOptionsForConfirmationCode(
        email,
        confirmationCode,
      );

    await this.commandBus.execute(new EmailSendingCommand(mailOptions));

    await this.sentEmailsTimeRepository.addConfirmationCode(email);
  }
}

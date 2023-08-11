import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MailsRawSqlRepository } from '../../infrastructure/mails-raw-sql.repository';
import { SentEmailsTimeConfirmAndRecoverCodesRepository } from '../../infrastructure/sent-email-confirmation-code-time.repository';
import { SendRecoveryCodesCommand } from './send-recovery-codes';
import { EmailsRecoveryCodesEntity } from '../../entities/emails-recovery-codes.entity';

export class FindAndSendRecoveryCodeCommand {}

@CommandHandler(FindAndSendRecoveryCodeCommand)
export class FindAndSendRecoveryCodeUseCase
  implements ICommandHandler<FindAndSendRecoveryCodeCommand>
{
  constructor(
    protected mailsRawSqlRepository: MailsRawSqlRepository,
    protected sentEmailsTimeRepository: SentEmailsTimeConfirmAndRecoverCodesRepository,
    protected commandBus: CommandBus,
  ) {}

  async execute(): Promise<void> {
    const emailAndCode: EmailsRecoveryCodesEntity | null =
      await this.mailsRawSqlRepository.findOldestRecoveryCode();

    if (emailAndCode) {
      await this.commandBus.execute(new SendRecoveryCodesCommand(emailAndCode));

      const { codeId, email } = emailAndCode;

      await this.sentEmailsTimeRepository.addConfirmationCode(codeId, email);
      await this.mailsRawSqlRepository.updateRecoveryCodesStatusToSent(codeId);
    }
  }
}

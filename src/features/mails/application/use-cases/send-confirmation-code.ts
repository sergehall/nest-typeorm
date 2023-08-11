import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EmailsConfirmCodeEntity } from '../../entities/emails-confirm-code.entity';
import { SendRegistrationCodesCommand } from '../../adapters/use-case/send-registration-codes.use-case';
import { MailsRawSqlRepository } from '../../infrastructure/mails-raw-sql.repository';
import { SentEmailsTimeConfirmAndRecoverCodesRepository } from '../../infrastructure/sent-email-confirmation-code-time.repository';

export class SendConfirmationCodeCommand {}

@CommandHandler(SendConfirmationCodeCommand)
export class SendConfirmationCodeUseCase
  implements ICommandHandler<SendConfirmationCodeCommand>
{
  constructor(
    protected mailsRawSqlRepository: MailsRawSqlRepository,
    protected sentEmailsTimeRepository: SentEmailsTimeConfirmAndRecoverCodesRepository,
    protected commandBus: CommandBus,
  ) {}

  async execute(): Promise<void> {
    const emailAndCode: EmailsConfirmCodeEntity | null =
      await this.mailsRawSqlRepository.findOldestConfCode();

    if (emailAndCode) {
      await this.commandBus.execute(
        new SendRegistrationCodesCommand(emailAndCode),
      );

      const { codeId, email } = emailAndCode;
      await this.sentEmailsTimeRepository.addConfirmationCode(codeId, email);
      await this.mailsRawSqlRepository.updateEmailStatusToSent(codeId);
    }
  }
}

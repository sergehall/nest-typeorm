import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EmailsConfirmCodeEntity } from '../../../mails/entities/emails-confirm-code.entity';
import { SendRegistrationCodesCommand } from '../../../mails/adapters/use-case/send-registration-codes.use-case';
import { MailsRawSqlRepository } from '../../../mails/infrastructure/mails-raw-sql.repository';
import { SentEmailsTimeConfirmAndRecoverCodesRepository } from '../../../mails/infrastructure/sent-email-confirmation-code-time.repository';

export class FindAndSendConfirmationCommand {}

@CommandHandler(FindAndSendConfirmationCommand)
export class FindAndSendConfirmationCodeUseCase
  implements ICommandHandler<FindAndSendConfirmationCommand>
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
      // console.log(emailAndCode, 'RegistrationCodes');
      await this.commandBus.execute(
        new SendRegistrationCodesCommand(emailAndCode),
      );

      const { codeId, email } = emailAndCode;
      await this.sentEmailsTimeRepository.addConfirmationCode(codeId, email);
      await this.mailsRawSqlRepository.updateConfirmationCodesStatusToSent(
        codeId,
      );
    }
  }
}

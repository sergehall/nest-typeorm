import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRawSqlRepository } from '../../../users/infrastructure/users-raw-sql.repository';
import * as uuid4 from 'uuid4';
import { EmailsRecoveryCodesEntity } from '../../../mails/entities/emails-recovery-codes.entity';
import { MailsService } from '../../../mails/application/mails.service';
import { ExpirationDateCalculator } from '../../../../common/calculator/expiration-date-calculator';

export class PasswordRecoveryViaEmailConfirmationCommand {
  constructor(public email: string) {}
}

@CommandHandler(PasswordRecoveryViaEmailConfirmationCommand)
export class PasswordRecoveryViaEmailConfirmationUseCase
  implements ICommandHandler<PasswordRecoveryViaEmailConfirmationCommand>
{
  constructor(
    protected usersRawSqlRepository: UsersRawSqlRepository,
    protected expirationDateCalculator: ExpirationDateCalculator,
    protected mailsService: MailsService,
  ) {}
  async execute(
    command: PasswordRecoveryViaEmailConfirmationCommand,
  ): Promise<boolean> {
    const { email } = command;

    const recoveryCode = uuid4().toString();

    // Return the expirationDate in ISO format for user registration.
    const expirationDate = await this.expirationDateCalculator.createExpDate(
      0,
      1,
      0,
    );

    const newConfirmationCode: EmailsRecoveryCodesEntity =
      await this.mailsService.updateRecoveryCode(
        email,
        recoveryCode,
        expirationDate,
      );

    await this.usersRawSqlRepository.updateUserConfirmationCodeByEmail(
      email,
      newConfirmationCode.recoveryCode,
      newConfirmationCode.expirationDate,
    );

    return true;
  }
}

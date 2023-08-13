import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRawSqlRepository } from '../../../users/infrastructure/users-raw-sql.repository';
import * as uuid4 from 'uuid4';
import { MailsService } from '../../../../mails/application/mails.service';
import { ExpirationDateCalculator } from '../../../../common/calculator/expiration-date-calculator';

export class PasswordRecoveryCommand {
  constructor(public email: string) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCase
  implements ICommandHandler<PasswordRecoveryCommand>
{
  constructor(
    protected usersRawSqlRepository: UsersRawSqlRepository,
    protected expirationDateCalculator: ExpirationDateCalculator,
    protected mailsService: MailsService,
  ) {}
  async execute(command: PasswordRecoveryCommand): Promise<boolean> {
    const { email } = command;

    const recoveryCode = uuid4().toString();

    // Return the expirationDate in ISO format for user registration.
    const expirationDate = await this.expirationDateCalculator.createExpDate(
      0,
      1,
      0,
    );

    await this.mailsService.sendRecoveryCode(email, recoveryCode);

    await this.usersRawSqlRepository.updateCodeAndExpirationByEmail(
      email,
      recoveryCode,
      expirationDate,
    );

    return true;
  }
}

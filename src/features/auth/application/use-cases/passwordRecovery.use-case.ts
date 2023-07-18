import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRawSqlRepository } from '../../../users/infrastructure/users-raw-sql.repository';
import * as uuid4 from 'uuid4';
import { MailsRawSqlRepository } from '../../../mails/infrastructure/mails-raw-sql.repository';
import { TablesUsersEntityWithId } from '../../../users/entities/userRawSqlWithId.entity';
import { EmailsRecoveryCodesEntity } from '../../../demons/entities/emailsRecoveryCodes.entity';

export class PasswordRecoveryCommand {
  constructor(public email: string) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCase
  implements ICommandHandler<PasswordRecoveryCommand>
{
  constructor(
    protected usersRawSqlRepository: UsersRawSqlRepository,
    protected mailsRawSqlRepository: MailsRawSqlRepository,
  ) {}
  async execute(command: PasswordRecoveryCommand): Promise<boolean> {
    const { email } = command;
    const user: TablesUsersEntityWithId | null =
      await this.usersRawSqlRepository.findUserByEmail(email);
    const newConfirmationCode: EmailsRecoveryCodesEntity = {
      codeId: uuid4().toString(),
      email: email,
      recoveryCode: uuid4().toString(),
      expirationDate: new Date(Date.now() + 65 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    };
    if (!user) {
      await this.mailsRawSqlRepository.createEmailRecoveryCode(
        newConfirmationCode,
      );
      return true;
    }

    await this.usersRawSqlRepository.updateUserConfirmationCode(
      user.id,
      newConfirmationCode.recoveryCode,
      newConfirmationCode.expirationDate,
    );
    await this.mailsRawSqlRepository.createEmailRecoveryCode(
      newConfirmationCode,
    );
    return true;
  }
}

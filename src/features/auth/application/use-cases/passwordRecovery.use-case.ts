import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRawSqlRepository } from '../../../users/infrastructure/users-raw-sql.repository';
import * as uuid4 from 'uuid4';
import { MailsRawSqlRepository } from '../../../mails/infrastructure/mails-raw-sql.repository';
import { TablesUsersEntityWithId } from '../../../users/entities/userRawSqlWithId.entity';
import { EmailsConfirmCodeEntity } from '../../../demons/entities/emailsConfirmCode.entity';

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
    const newConfirmationCode: EmailsConfirmCodeEntity = {
      codeId: uuid4().toString(),
      email: email,
      confirmationCode: uuid4().toString(),
      expirationDate: new Date(Date.now() + 65 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    };
    if (!user) {
      await this.mailsRawSqlRepository.createEmailConfirmCode(
        newConfirmationCode,
      );
      return true;
    }

    await this.usersRawSqlRepository.updateUserConfirmationCode(
      user.id,
      newConfirmationCode.confirmationCode,
      newConfirmationCode.expirationDate,
    );
    await this.mailsRawSqlRepository.createEmailConfirmCode(
      newConfirmationCode,
    );
    return true;
  }
}

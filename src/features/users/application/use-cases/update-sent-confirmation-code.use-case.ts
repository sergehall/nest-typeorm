import * as uuid4 from 'uuid4';
import { HttpException, HttpStatus } from '@nestjs/common';
import { MailsRawSqlRepository } from '../../../mails/infrastructure/mails-raw-sql.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRawSqlRepository } from '../../infrastructure/users-raw-sql.repository';
import { TablesUsersWithIdEntity } from '../../entities/tables-user-with-id.entity';
import { emailNotExistsOrIsConfirmed } from '../../../../exception-filter/custom-errors-messages';

export class UpdateSentConfirmationCodeCommand {
  constructor(public email: string) {}
}
@CommandHandler(UpdateSentConfirmationCodeCommand)
export class UpdateSentConfirmationCodeUseCase
  implements ICommandHandler<UpdateSentConfirmationCodeCommand>
{
  constructor(
    private readonly mailsRepository: MailsRawSqlRepository,
    private readonly usersRawSqlRepository: UsersRawSqlRepository,
  ) {}

  async execute(command: UpdateSentConfirmationCodeCommand): Promise<boolean> {
    const user: TablesUsersWithIdEntity | null =
      await this.usersRawSqlRepository.findUserByLoginOrEmail(command.email);
    const expirationDate = new Date(Date.now() + 65 * 60 * 1000).toISOString();
    if (
      user &&
      !user.isConfirmed &&
      user.expirationDate > new Date().toISOString()
    ) {
      const confirmationCode = uuid4().toString();
      await this.usersRawSqlRepository.updateUserConfirmationCode(
        user.id,
        confirmationCode,
        expirationDate,
      );

      const newEmailConfirmationCode = {
        codeId: uuid4().toString(),
        email: user.email,
        confirmationCode,
        expirationDate,
        createdAt: new Date().toISOString(),
      };

      await this.mailsRepository.createEmailConfirmCode(
        newEmailConfirmationCode,
      );
      return true;
    } else {
      throw new HttpException(
        { message: [emailNotExistsOrIsConfirmed] },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}

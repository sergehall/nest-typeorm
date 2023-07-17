import * as uuid4 from 'uuid4';
import { HttpException, HttpStatus } from '@nestjs/common';
import { userNotExists } from '../../../../exception-filter/errors-messages';
import { MailsRawSqlRepository } from '../../../mails/infrastructure/mails-raw-sql.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRawSqlRepository } from '../../infrastructure/users-raw-sql.repository';
import { TablesUsersEntityWithId } from '../../entities/userRawSqlWithId.entity';

export class UpdateSentConfirmationCodeCommand {
  constructor(public email: string) {}
}

@CommandHandler(UpdateSentConfirmationCodeCommand)
export class UpdateSentConfirmationCodeUseCase
  implements ICommandHandler<UpdateSentConfirmationCodeCommand>
{
  constructor(
    protected mailsRepository: MailsRawSqlRepository,
    protected usersRawSqlRepository: UsersRawSqlRepository,
  ) {}
  async execute(command: UpdateSentConfirmationCodeCommand): Promise<boolean> {
    const user: TablesUsersEntityWithId | null =
      await this.usersRawSqlRepository.findUserByLoginOrEmail(command.email);
    // The expression Date.now() + 65 * 60 * 1000 calculates the value of the current timestamp in milliseconds plus 65 minutes converted to milliseconds.
    const expirationDate = new Date(Date.now() + 65 * 60 * 1000).toISOString();
    if (user && !user.isConfirmed) {
      if (user.expirationDate > new Date().toISOString()) {
        user.confirmationCode = uuid4().toString();
        user.expirationDate = expirationDate;
        // update user with confirmationCode and expirationDate
        await this.usersRawSqlRepository.updateUserConfirmationCode(
          user.id,
          user.confirmationCode,
          user.expirationDate,
        );
        const newEmailConfirmationCode = {
          codeId: uuid4().toString(),
          email: user.email,
          confirmationCode: user.confirmationCode,
          expirationDate: new Date(Date.now() + 65 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
        };
        // add Email to emailsToSentRepository
        await this.mailsRepository.createEmailConfirmCode(
          newEmailConfirmationCode,
        );
      }
      return true;
    } else {
      throw new HttpException(
        { message: [userNotExists] },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}

import * as uuid4 from 'uuid4';
import { HttpException, HttpStatus } from '@nestjs/common';
import { userNotExists } from '../../../../exception-filter/errors-messages';
import { UsersRepository } from '../../infrastructure/users.repository';
import { MailsRawSqlRepository } from '../../../mails/infrastructure/mails-raw-sql.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRawSqlRepository } from '../../infrastructure/users-raw-sql.repository';

export class UpdateSentConfirmationCodeCommand {
  constructor(public email: string) {}
}

@CommandHandler(UpdateSentConfirmationCodeCommand)
export class UpdateSentConfirmationCodeUseCase
  implements ICommandHandler<UpdateSentConfirmationCodeCommand>
{
  constructor(
    protected usersRepository: UsersRepository,
    protected mailsRepository: MailsRawSqlRepository,
    protected usersRawSqlRepository: UsersRawSqlRepository,
  ) {}
  async execute(command: UpdateSentConfirmationCodeCommand): Promise<boolean> {
    const user = await this.usersRepository.findUserByLoginOrEmail(
      command.email,
    );
    const expirationDate = new Date(Date.now() + 65 * 60 * 1000).toISOString();
    if (user && !user.emailConfirmation.isConfirmed) {
      if (user.emailConfirmation.expirationDate > new Date().toISOString()) {
        user.emailConfirmation.confirmationCode = uuid4().toString();
        user.emailConfirmation.expirationDate = expirationDate;
        // update user
        await this.usersRawSqlRepository.updateUserConfirmationCode(user);

        const newEmailConfirmationCode = {
          id: uuid4().toString(),
          email: user.email,
          confirmationCode: user.emailConfirmation.confirmationCode,
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

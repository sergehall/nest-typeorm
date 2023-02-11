import * as uuid4 from 'uuid4';
import { HttpException, HttpStatus } from '@nestjs/common';
import { userNotExists } from '../../../../exception-filter/errors-messages';
import { UsersRepository } from '../../infrastructure/users.repository';
import { MailsRepository } from '../../../mails/infrastructure/mails.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class UpdateSentConfirmationCodeCommand {
  constructor(public email: string) {}
}

@CommandHandler(UpdateSentConfirmationCodeCommand)
export class UpdateSentConfirmationCodeUseCase
  implements ICommandHandler<UpdateSentConfirmationCodeCommand>
{
  constructor(
    protected usersRepository: UsersRepository,
    protected mailsRepository: MailsRepository,
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
        await this.usersRepository.updateUserConfirmationCode(user);

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

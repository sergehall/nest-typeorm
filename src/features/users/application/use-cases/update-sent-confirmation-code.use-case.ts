import * as uuid4 from 'uuid4';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRawSqlRepository } from '../../infrastructure/users-raw-sql.repository';
import { TablesUsersWithIdEntity } from '../../entities/tables-user-with-id.entity';
import { emailNotExistsOrIsConfirmed } from '../../../../common/filters/custom-errors-messages';
import { ExpirationDateCalculator } from '../../../../common/calculator/expiration-date-calculator';
import { MailsService } from '../../../../mails/application/mails.service';

export class UpdateSentConfirmationCodeCommand {
  constructor(public email: string) {}
}
@CommandHandler(UpdateSentConfirmationCodeCommand)
export class UpdateSentConfirmationCodeUseCase
  implements ICommandHandler<UpdateSentConfirmationCodeCommand>
{
  constructor(
    private readonly mailsService: MailsService,
    private readonly usersRawSqlRepository: UsersRawSqlRepository,
    private readonly expirationDateCalculator: ExpirationDateCalculator,
  ) {}

  async execute(command: UpdateSentConfirmationCodeCommand): Promise<boolean> {
    const user: TablesUsersWithIdEntity | null =
      await this.usersRawSqlRepository.findUserByLoginOrEmail(command.email);
    if (
      user &&
      !user.isConfirmed &&
      user.expirationDate > new Date().toISOString()
    ) {
      const { email } = user;

      const confirmationCode = uuid4().toString();

      // Return the expirationDate in ISO format for user registration.
      const expirationDate = await this.expirationDateCalculator.createExpDate(
        0,
        1,
        0,
      );

      await this.usersRawSqlRepository.updateUserConfirmationCodeByEmail(
        email,
        confirmationCode,
        expirationDate,
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

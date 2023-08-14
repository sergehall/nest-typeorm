import * as uuid4 from 'uuid4';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRawSqlRepository } from '../../infrastructure/users-raw-sql.repository';
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
    const { email } = command;

    const confirmationCode = uuid4().toString();

    const expirationDate = await this.expirationDateCalculator.createExpDate(
      0,
      1,
      0,
    );

    await this.usersRawSqlRepository.updateCodeAndExpirationByEmail(
      email,
      confirmationCode,
      expirationDate,
    );

    return await this.mailsService.sendConfirmationCode(
      email,
      confirmationCode,
    );
  }
}

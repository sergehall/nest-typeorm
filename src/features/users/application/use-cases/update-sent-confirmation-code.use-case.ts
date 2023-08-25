import * as uuid4 from 'uuid4';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ExpirationDateCalculator } from '../../../../common/helpers/expiration-date-calculator';
import { MailsService } from '../../../../mails/application/mails.service';
import { UsersRepo } from '../../infrastructure/users-repo';
import { UsersEntity } from '../../entities/users.entity';

export class UpdateSentConfirmationCodeCommand {
  constructor(public email: string) {}
}
@CommandHandler(UpdateSentConfirmationCodeCommand)
export class UpdateSentConfirmationCodeUseCase
  implements ICommandHandler<UpdateSentConfirmationCodeCommand>
{
  constructor(
    private readonly mailsService: MailsService,
    private readonly usersRepo: UsersRepo,
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

    const updatedUser: UsersEntity =
      await this.usersRepo.updateCodeAndExpirationByEmail(
        email,
        confirmationCode,
        expirationDate,
      );

    return await this.mailsService.sendConfirmationCode(updatedUser);
  }
}

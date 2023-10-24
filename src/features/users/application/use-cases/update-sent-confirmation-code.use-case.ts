import * as uuid4 from 'uuid4';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ExpirationDateCalculator } from '../../../../common/helpers/expiration-date-calculator';
import { MailsService } from '../../../../common/mails/application/mails.service';
import { UsersRepo } from '../../infrastructure/users-repo';
import { UsersEntity } from '../../entities/users.entity';
import { ExpirationDateDto } from '../../../../common/helpers/dto/expiration-date.dto';

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

    const expirationDateDto: ExpirationDateDto =
      await this.expirationDateCalculator.createExpDate(0, 1, 0);

    const updatedUser: UsersEntity | null =
      await this.usersRepo.updateCodeAndExpirationByEmail(
        email,
        confirmationCode,
        expirationDateDto.expirationDate,
      );

    if (!updatedUser) {
      throw new Error(
        `Invalid update user confirmationCode: ${confirmationCode}`,
      );
    }

    return await this.mailsService.sendConfirmationCode(updatedUser);
  }
}

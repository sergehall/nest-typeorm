import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import * as uuid4 from 'uuid4';
import { MailsService } from '../../../../mails/application/mails.service';
import { ExpirationDateCalculator } from '../../../../common/helpers/expiration-date-calculator';
import { UsersRepo } from '../../../users/infrastructure/users-repo';
import { UsersEntity } from '../../../users/entities/users.entity';
import { NotFoundException } from '@nestjs/common';

export class PasswordRecoveryCommand {
  constructor(public email: string) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCase
  implements ICommandHandler<PasswordRecoveryCommand>
{
  constructor(
    private readonly usersRepo: UsersRepo,
    private readonly expirationDateCalculator: ExpirationDateCalculator,
    private readonly mailsService: MailsService,
  ) {}
  async execute(command: PasswordRecoveryCommand): Promise<boolean> {
    const { email } = command;

    const recoveryCode = uuid4().toString();

    const expirationDate = await this.expirationDateCalculator.createExpDate(
      0,
      2,
      0,
    );

    const updatedUser: UsersEntity | null =
      await this.usersRepo.updateCodeAndExpirationByEmail(
        email,
        recoveryCode,
        expirationDate,
      );

    if (!updatedUser) {
      throw new NotFoundException(`User with email: ${email} not found`);
    }

    return await this.mailsService.sendRecoveryCode(updatedUser);
  }
}

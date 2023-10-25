import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import * as uuid4 from 'uuid4';
import { ExpirationDateCalculator } from '../../../../common/helpers/expiration-date-calculator';
import { UsersRepo } from '../../../users/infrastructure/users-repo';
import { UsersEntity } from '../../../users/entities/users.entity';
import { NotFoundException } from '@nestjs/common';
import { ExpirationDateDto } from '../../../../common/helpers/dto/expiration-date.dto';
import { UpdatedConfirmationCodeByRecoveryCodeEvent } from '../../events/updated-confirmation-code-by-recovery-code.event';

export class PasswordRecoveryCommand {
  constructor(public email: string) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCase
  implements ICommandHandler<PasswordRecoveryCommand>
{
  constructor(
    private readonly usersRepo: UsersRepo,
    private readonly eventBus: EventBus,
    private readonly expirationDateCalculator: ExpirationDateCalculator,
  ) {}
  async execute(command: PasswordRecoveryCommand): Promise<boolean> {
    const { email } = command;

    const recoveryCode = uuid4().toString();

    const expirationDateDto: ExpirationDateDto =
      await this.expirationDateCalculator.createExpDate(0, 2, 0);

    const updatedUser: UsersEntity | null =
      await this.usersRepo.updateCodeAndExpirationByEmail(
        email,
        recoveryCode,
        expirationDateDto.expirationDate,
      );

    if (!updatedUser) {
      throw new NotFoundException(`User with email: ${email} not found`);
    }

    const event: UpdatedConfirmationCodeByRecoveryCodeEvent =
      new UpdatedConfirmationCodeByRecoveryCodeEvent(updatedUser);
    updatedUser.events.push(event);

    updatedUser.events.forEach((e) => {
      this.eventBus.publish(e);
    });

    return true;
  }
}

import * as uuid4 from 'uuid4';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepo } from '../../infrastructure/users-repo';
import { UsersEntity } from '../../entities/users.entity';
import { ExpirationDateDto } from '../../../../common/helpers/calculator-expiration-date/dto/expiration-date.dto';
import { UpdatedConfirmationCodeEvent } from '../../../auth/events/updated-confirmation-code.event';
import { CalculatorExpirationDate } from '../../../../common/helpers/calculator-expiration-date/calculator-expiration-date';

export class UpdateSentConfirmationCodeCommand {
  constructor(public email: string) {}
}
@CommandHandler(UpdateSentConfirmationCodeCommand)
export class UpdateSentConfirmationCodeUseCase
  implements ICommandHandler<UpdateSentConfirmationCodeCommand>
{
  constructor(
    private readonly usersRepo: UsersRepo,
    private readonly eventBus: EventBus,
    private readonly expirationDateCalculator: CalculatorExpirationDate,
  ) {}
  async execute(command: UpdateSentConfirmationCodeCommand): Promise<boolean> {
    const { email } = command;

    const confirmationCode = uuid4().toString();

    const expirationDateDto: ExpirationDateDto =
      await this.expirationDateCalculator.createExpDate(0, 1, 0);

    const updatedUser: UsersEntity =
      await this.usersRepo.updateCodeAndExpirationByEmail(
        email,
        confirmationCode,
        expirationDateDto.expirationDate,
      );

    const event: UpdatedConfirmationCodeEvent =
      new UpdatedConfirmationCodeEvent(updatedUser);
    updatedUser.events.push(event);

    updatedUser.events.forEach((e) => {
      this.eventBus.publish(e);
    });

    return true;
  }
}

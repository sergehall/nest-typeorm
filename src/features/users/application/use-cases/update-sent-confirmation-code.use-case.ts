import * as uuid4 from 'uuid4';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { ExpirationDateCalculator } from '../../../../common/helpers/expiration-date-calculator';
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
    private readonly usersRepo: UsersRepo,
    private readonly eventBus: EventBus,
    private readonly expirationDateCalculator: ExpirationDateCalculator,
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

    updatedUser.events.forEach((e) => {
      this.eventBus.publish(e);
    });

    return true;
  }
}

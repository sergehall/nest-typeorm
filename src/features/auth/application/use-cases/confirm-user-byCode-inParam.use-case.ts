import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRawSqlRepository } from '../../../users/infrastructure/users-raw-sql.repository';

export class ConfirmUserByCodeCommand {
  constructor(public code: string) {}
}

@CommandHandler(ConfirmUserByCodeCommand)
export class ConfirmUserByCodeUseCase
  implements ICommandHandler<ConfirmUserByCodeCommand>
{
  constructor(protected usersRawSqlRepository: UsersRawSqlRepository) {}
  async execute(command: ConfirmUserByCodeCommand): Promise<boolean> {
    const userToUpdateConfirmCode =
      await this.usersRawSqlRepository.findUserByConfirmationCode(command.code);

    const currentDate = new Date().toISOString();

    if (
      !userToUpdateConfirmCode ||
      (!userToUpdateConfirmCode.isConfirmed &&
        userToUpdateConfirmCode.expirationDate <= currentDate)
    ) {
      return false;
    }

    if (userToUpdateConfirmCode.isConfirmed) {
      return true;
    }

    return await this.usersRawSqlRepository.confirmUserByConfirmCode(
      command.code,
      true,
      currentDate,
    ); // Returning true if the user was successfully updated, otherwise false.
  }
}

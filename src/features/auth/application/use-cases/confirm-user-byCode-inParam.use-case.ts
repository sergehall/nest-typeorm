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
    if (
      userToUpdateConfirmCode &&
      !userToUpdateConfirmCode.isConfirmed &&
      userToUpdateConfirmCode.expirationDate > new Date().toISOString()
    ) {
      const isConfirmed = true;
      const isConfirmedDate: string = new Date().toISOString();

      // 'Congratulations account is confirmed. Send a message not here. To email that has been confirmed.';

      return await this.usersRawSqlRepository.confirmUserByConfirmCode(
        command.code,
        isConfirmed,
        isConfirmedDate,
      );
    }
    return false;
  }
}

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRawSqlRepository } from '../../../users/infrastructure/users-raw-sql.repository';

export class ConfirmUserByCodeInParamCommand {
  constructor(public code: string) {}
}

@CommandHandler(ConfirmUserByCodeInParamCommand)
export class ConfirmUserByCodeInParamUseCase
  implements ICommandHandler<ConfirmUserByCodeInParamCommand>
{
  constructor(protected usersRawSqlRepository: UsersRawSqlRepository) {}
  async execute(command: ConfirmUserByCodeInParamCommand): Promise<boolean> {
    const userToUpdateConfirmCode =
      await this.usersRawSqlRepository.findUserByConfirmationCode(command.code);
    if (
      userToUpdateConfirmCode &&
      !userToUpdateConfirmCode.isConfirmed &&
      userToUpdateConfirmCode.expirationDate > new Date().toISOString()
    ) {
      const isConfirmed = true;
      const isConfirmedDate: string = new Date().toISOString();
      return await this.usersRawSqlRepository.confirmUserByConfirmCode(
        command.code,
        isConfirmed,
        isConfirmedDate,
      );
    }
    return false;
  }
}

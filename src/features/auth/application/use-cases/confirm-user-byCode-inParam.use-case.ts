import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRawSqlRepository } from '../../infrastructure/raw-sql-repository/users-raw-sql.repository';

export class ConfirmUserByCodeInParamCommand {
  constructor(public code: string) {}
}

@CommandHandler(ConfirmUserByCodeInParamCommand)
export class ConfirmUserByCodeInParamUseCase
  implements ICommandHandler<ConfirmUserByCodeInParamCommand>
{
  constructor(
    protected usersRepository: UsersRepository,
    protected usersRawSqlRepository: UsersRawSqlRepository,
  ) {}
  async execute(command: ConfirmUserByCodeInParamCommand): Promise<boolean> {
    const userToUpdateConfirmCode =
      await this.usersRawSqlRepository.findUserByConfirmationCode(command.code);
    if (
      userToUpdateConfirmCode &&
      !userToUpdateConfirmCode.isConfirmed &&
      userToUpdateConfirmCode.expirationDate > new Date().toISOString()
    ) {
      const isConfirmed = true;
      const isConfirmedDate = new Date().toISOString();
      return await this.usersRawSqlRepository.confirmUserByConfirmCode(
        command.code,
        isConfirmed,
        isConfirmedDate,
      );
    }
    return false;
  }
}

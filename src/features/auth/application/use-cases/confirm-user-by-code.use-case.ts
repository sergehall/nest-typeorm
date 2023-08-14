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
    const { code } = command;

    const updateIsConfirmed =
      await this.usersRawSqlRepository.isConfirmedUserByCode(code);
    if (!updateIsConfirmed) {
      return false;
    }
    console.log(
      'Congratulations account is confirmed. Send a message not here, into email that has been confirmed.',
    );
    return true;
  }
}

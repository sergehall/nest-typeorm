import * as bcrypt from 'bcrypt';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRawSqlRepository } from '../../../users/infrastructure/users-raw-sql.repository';
import { TablesUsersEntity } from '../../../users/entities/tablesUsers.entity';

export class ValidatePasswordCommand {
  constructor(public loginOrEmail: string, public password: string) {}
}

@CommandHandler(ValidatePasswordCommand)
export class ValidatePasswordUseCase
  implements ICommandHandler<ValidatePasswordCommand>
{
  constructor(protected usersRawSqlRepository: UsersRawSqlRepository) {}
  async execute(
    command: ValidatePasswordCommand,
  ): Promise<TablesUsersEntity | null> {
    const user = await this.usersRawSqlRepository.findUserByLoginOrEmail(
      command.loginOrEmail,
    );
    if (
      user &&
      !user.isBanned &&
      (await bcrypt.compare(command.password, user.passwordHash))
    ) {
      return user;
    }
    return null;
  }
}

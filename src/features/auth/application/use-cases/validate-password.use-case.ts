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
    const { loginOrEmail, password } = command;
    const user = await this.usersRawSqlRepository.findUserByLoginOrEmail(
      loginOrEmail,
    );
    const isValidPassword =
      user &&
      !user.isBanned &&
      (await bcrypt.compare(password, user.passwordHash));
    return isValidPassword ? user : null;
  }
}

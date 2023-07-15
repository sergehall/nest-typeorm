import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRawSqlRepository } from '../../infrastructure/users-raw-sql.repository';
import { TablesUsersEntity } from '../../entities/tablesUsers.entity';

export class CheckingUserExistenceCommand {
  constructor(public login: string, public email: string) {}
}

@CommandHandler(CheckingUserExistenceCommand)
export class CheckingUserExistenceUseCase
  implements ICommandHandler<CheckingUserExistenceCommand>
{
  constructor(protected usersRawSqlRepository: UsersRawSqlRepository) {}
  async execute(
    command: CheckingUserExistenceCommand,
  ): Promise<TablesUsersEntity | null> {
    return await this.usersRawSqlRepository.userAlreadyExist(
      command.login,
      command.email,
    );
  }
}

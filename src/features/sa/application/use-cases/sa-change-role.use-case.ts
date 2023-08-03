import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRawSqlRepository } from '../../../users/infrastructure/users-raw-sql.repository';
import { TablesUsersEntity } from '../../../users/entities/tables-users.entity';
import { TablesUsersWithIdEntity } from '../../../users/entities/tables-user-with-id.entity';
import { RolesEnums } from '../../../../ability/enums/roles.enums';

export class ChangeRoleCommand {
  constructor(public newUser: TablesUsersWithIdEntity) {}
}

@CommandHandler(ChangeRoleCommand)
export class SaChangeRoleUseCase implements ICommandHandler<ChangeRoleCommand> {
  constructor(protected usersRawSqlRepository: UsersRawSqlRepository) {}
  async execute(command: ChangeRoleCommand): Promise<TablesUsersEntity> {
    command.newUser.roles = RolesEnums.SA;

    return await this.usersRawSqlRepository.changeRole(
      command.newUser.id,
      command.newUser.roles,
    );
  }
}

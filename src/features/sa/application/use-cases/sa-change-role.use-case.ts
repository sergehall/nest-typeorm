import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InternalServerErrorException } from '@nestjs/common';
import { UsersRawSqlRepository } from '../../../users/infrastructure/users-raw-sql.repository';
import { TablesUsersEntity } from '../../../users/entities/tablesUsers.entity';
import { TablesUsersEntityWithId } from '../../../users/entities/userRawSqlWithId.entity';

export class ChangeRoleCommand {
  constructor(public newUser: TablesUsersEntityWithId) {}
}

@CommandHandler(ChangeRoleCommand)
export class SaChangeRoleUseCase implements ICommandHandler<ChangeRoleCommand> {
  constructor(protected usersRawSqlRepository: UsersRawSqlRepository) {}
  async execute(command: ChangeRoleCommand): Promise<TablesUsersEntity> {
    const updateRole: TablesUsersEntity =
      await this.usersRawSqlRepository.changeRole(
        command.newUser.id,
        command.newUser.roles,
      );
    if (!updateRole) throw new InternalServerErrorException();
    return updateRole;
  }
}
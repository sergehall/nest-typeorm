import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepo } from '../../../users/infrastructure/users-repo';
import { Users } from '../../../users/entities/users.entity';

export class ChangeRoleCommand {
  constructor(public userId: string) {}
}

@CommandHandler(ChangeRoleCommand)
export class SaChangeRoleUseCase implements ICommandHandler<ChangeRoleCommand> {
  constructor(protected usersRepo: UsersRepo) {}
  async execute(command: ChangeRoleCommand): Promise<Users | null> {
    return await this.usersRepo.updateUserRole(command.userId);
  }
}

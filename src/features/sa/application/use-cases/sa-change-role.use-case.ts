import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepo } from '../../../users/infrastructure/users-repo';

export class ChangeRoleCommand {
  constructor(public userId: string) {}
}

@CommandHandler(ChangeRoleCommand)
export class SaChangeRoleUseCase implements ICommandHandler<ChangeRoleCommand> {
  constructor(protected usersRepo: UsersRepo) {}
  async execute(command: ChangeRoleCommand): Promise<boolean> {
    const saUser = await this.usersRepo.updateUserRole(command.userId);

    if (!saUser) throw new Error(`Error updating user role: sa`);

    return true;
  }
}

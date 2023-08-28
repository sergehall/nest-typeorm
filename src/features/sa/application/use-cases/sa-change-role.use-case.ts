import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepo } from '../../../users/infrastructure/users-repo';
import { ReturnUsersBanInfoEntity } from '../../entities/return-users-banInfo.entity';

export class ChangeRoleCommand {
  constructor(public userId: string) {}
}

@CommandHandler(ChangeRoleCommand)
export class SaChangeRoleUseCase implements ICommandHandler<ChangeRoleCommand> {
  constructor(protected usersRepo: UsersRepo) {}
  async execute(command: ChangeRoleCommand): Promise<ReturnUsersBanInfoEntity> {
    const saUser = await this.usersRepo.updateUserRole(command.userId);

    if (!saUser) throw new Error(`Error updating user role: sa`);

    return {
      id: saUser.userId,
      login: saUser.login,
      email: saUser.email,
      createdAt: saUser.createdAt,
      banInfo: {
        isBanned: saUser.isBanned,
        banDate: saUser.banDate,
        banReason: saUser.banReason,
      },
    };
  }
}

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepo } from '../../infrastructure/users-repo';
import { NotFoundException } from '@nestjs/common';
import { UsersEntity } from '../../entities/users.entity';
import { UserViewModel } from '../../views/user.view-model';

export class FindUserByICommand {
  constructor(public userId: string) {}
}

@CommandHandler(FindUserByICommand)
export class FindUserByIdUseCase implements ICommandHandler<FindUserByICommand> {
  constructor(protected usersRepo: UsersRepo) {}

  async execute(command: FindUserByICommand): Promise<UserViewModel> {
    const { userId } = command;

    const user: UsersEntity | null = await this.usersRepo.findNotBannedUserById(userId);

    if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

    return {
      id: user.userId,
      login: user.login,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}

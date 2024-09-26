import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepo } from '../../infrastructure/users-repo';
import { NotFoundException } from '@nestjs/common';
import { UsersEntity } from '../../entities/users.entity';

export class FindUserByICommand {
  constructor(public userId: string) {}
}

@CommandHandler(FindUserByICommand)
export class FindUserByIdUseCase
  implements ICommandHandler<FindUserByICommand>
{
  constructor(protected usersRepo: UsersRepo) {}

  async execute(command: FindUserByICommand): Promise<UsersEntity> {
    const { userId } = command;

    const user: UsersEntity | null =
      await this.usersRepo.findNotBannedUserById(userId);

    if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

    return user;
  }
}

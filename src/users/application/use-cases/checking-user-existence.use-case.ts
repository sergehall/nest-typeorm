import { UsersRepository } from '../../infrastructure/users.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class CheckingUserExistenceCommand {
  constructor(public login: string, public email: string) {}
}

@CommandHandler(CheckingUserExistenceCommand)
export class CheckingUserExistenceUseCase
  implements ICommandHandler<CheckingUserExistenceCommand>
{
  constructor(protected usersRepository: UsersRepository) {}
  async execute(command: CheckingUserExistenceCommand): Promise<string | null> {
    return await this.usersRepository.userAlreadyExist(
      command.login,
      command.email,
    );
  }
}

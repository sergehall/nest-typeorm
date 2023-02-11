import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class AddSentEmailTimeCommand {
  constructor(public email: string) {}
}

@CommandHandler(AddSentEmailTimeCommand)
export class AddSentEmailTimeUseCase
  implements ICommandHandler<AddSentEmailTimeCommand>
{
  constructor(protected usersRepository: UsersRepository) {}
  async execute(command: AddSentEmailTimeCommand) {
    const currentTime = new Date().toISOString();
    return await this.usersRepository.addSentEmailTime(
      command.email,
      currentTime,
    );
  }
}

import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class ConfirmUserByCodeInParamCommand {
  constructor(public code: string) {}
}

@CommandHandler(ConfirmUserByCodeInParamCommand)
export class ConfirmUserByCodeInParamUseCase
  implements ICommandHandler<ConfirmUserByCodeInParamCommand>
{
  constructor(protected usersRepository: UsersRepository) {}
  async execute(command: ConfirmUserByCodeInParamCommand): Promise<boolean> {
    const user = await this.usersRepository.findUserByConfirmationCode(
      command.code,
    );
    if (user) {
      if (!user.emailConfirmation.isConfirmed) {
        if (user.emailConfirmation.expirationDate > new Date().toISOString()) {
          user.emailConfirmation.isConfirmed = true;
          user.emailConfirmation.isConfirmedDate = new Date().toISOString();
          await this.usersRepository.updateUser(user);
          return true;
        }
      }
    }
    return false;
  }
}

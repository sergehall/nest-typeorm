import * as bcrypt from 'bcrypt';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepo } from '../../../users/infrastructure/users-repo';
import { UsersEntity } from '../../../users/entities/users.entity';

export class ValidatePasswordCommand {
  constructor(public loginOrEmail: string, public password: string) {}
}

@CommandHandler(ValidatePasswordCommand)
export class ValidatePasswordUseCase
  implements ICommandHandler<ValidatePasswordCommand>
{
  constructor(protected usersRepo: UsersRepo) {}
  async execute(command: ValidatePasswordCommand): Promise<UsersEntity | null> {
    const { loginOrEmail, password } = command;
    const user = await this.usersRepo.findUserByLoginOrEmail(loginOrEmail);
    const isValidPassword =
      user &&
      !user.isBanned &&
      (await bcrypt.compare(password, user.passwordHash));
    return isValidPassword ? user : null;
  }
}

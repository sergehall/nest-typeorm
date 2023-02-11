import { UsersEntity } from '../../../users/entities/users.entity';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../../../users/application/users.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class ValidatePasswordCommand {
  constructor(public loginOrEmail: string, public password: string) {}
}

@CommandHandler(ValidatePasswordCommand)
export class ValidatePasswordUseCase
  implements ICommandHandler<ValidatePasswordCommand>
{
  constructor(private usersService: UsersService) {}
  async execute(command: ValidatePasswordCommand): Promise<UsersEntity | null> {
    const user = await this.usersService.findUserByLoginOrEmail(
      command.loginOrEmail,
    );
    if (
      user &&
      !user.banInfo.isBanned &&
      (await bcrypt.compare(command.password, user.passwordHash))
    ) {
      return user;
    }
    return null;
  }
}

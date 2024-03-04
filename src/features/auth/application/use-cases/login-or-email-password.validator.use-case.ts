import * as bcrypt from 'bcrypt';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepo } from '../../../users/infrastructure/users-repo';
import { UsersEntity } from '../../../users/entities/users.entity';
import { HttpException, HttpStatus } from '@nestjs/common';
import { validatePasswordFailed } from '../../../../common/filters/custom-errors-messages';

export class LoginOrEmailPasswordValidatorCommand {
  constructor(public loginOrEmail: string, public password: string) {}
}

@CommandHandler(LoginOrEmailPasswordValidatorCommand)
export class LoginOrEmailPasswordValidatorUseCase
  implements ICommandHandler<LoginOrEmailPasswordValidatorCommand>
{
  constructor(private readonly usersRepo: UsersRepo) {}

  async execute(
    command: LoginOrEmailPasswordValidatorCommand,
  ): Promise<UsersEntity> {
    const { loginOrEmail, password } = command;

    const user: UsersEntity | null =
      await this.usersRepo.findUserByLoginOrEmail(loginOrEmail);

    if (
      !user ||
      user.isBanned ||
      !(await bcrypt.compare(password, user.passwordHash))
    ) {
      throw new HttpException(
        { message: [validatePasswordFailed] },
        HttpStatus.UNAUTHORIZED,
      );
    }

    return user;
  }
}

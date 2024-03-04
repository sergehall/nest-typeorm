import * as bcrypt from 'bcrypt';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepo } from '../../../users/infrastructure/users-repo';
import { UsersEntity } from '../../../users/entities/users.entity';
import { HttpException, HttpStatus } from '@nestjs/common';
import { validatePasswordFailed } from '../../../../common/filters/custom-errors-messages';

export class ValidatePasswordCommand {
  constructor(public loginOrEmail: string, public password: string) {}
}

@CommandHandler(ValidatePasswordCommand)
export class ValidatePasswordUseCase
  implements ICommandHandler<ValidatePasswordCommand>
{
  constructor(protected usersRepo: UsersRepo) {}
  async execute(command: ValidatePasswordCommand): Promise<UsersEntity> {
    const { loginOrEmail, password } = command;
    const user: UsersEntity | null =
      await this.usersRepo.findUserByLoginOrEmail(loginOrEmail);

    const isValidPassword =
      user &&
      !user.isBanned &&
      (await bcrypt.compare(password, user.passwordHash));

    if (!user || !isValidPassword) {
      throw new HttpException(
        {
          message: [validatePasswordFailed],
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    return user;
  }
}

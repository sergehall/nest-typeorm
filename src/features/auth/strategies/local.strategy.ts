import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../users/dto/current-user.dto';
import { UsersEntity } from '../../users/entities/users.entity';
import { ValidLoginOrEmailPasswordCommand } from '../application/use-cases/valid-login-or-email-password.use-case';
import { ValidLoginPasswordSizesCommand } from '../application/use-cases/valid-login-password-sizes.use-case';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(protected commandBus: CommandBus) {
    super({
      usernameField: 'loginOrEmail',
    });
  }

  async validate(
    loginOrEmail: string,
    password: string,
  ): Promise<CurrentUserDto | null> {
    await this.commandBus.execute(
      new ValidLoginPasswordSizesCommand(loginOrEmail, password),
    );

    const user: UsersEntity = await this.commandBus.execute(
      new ValidLoginOrEmailPasswordCommand(loginOrEmail, password),
    );

    return {
      userId: user.userId,
      login: user.login,
      email: user.email,
      orgId: user.orgId,
      roles: user.roles,
      isBanned: user.isBanned,
    };
  }
}

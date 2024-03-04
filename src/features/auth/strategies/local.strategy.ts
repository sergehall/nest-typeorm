import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ValidatePasswordCommand } from '../application/use-cases/validate-password.use-case';
import { CurrentUserDto } from '../../users/dto/current-user.dto';
import { LoginPasswordValidatorSizes } from '../../../common/helpers/login-password.validator-sizes';
import { UsersEntity } from '../../users/entities/users.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    protected commandBus: CommandBus,
    protected loginPasswordValidatorSizes: LoginPasswordValidatorSizes,
  ) {
    super({
      usernameField: 'loginOrEmail',
    });
  }

  async validate(
    loginOrEmail: string,
    password: string,
  ): Promise<CurrentUserDto | null> {
    console.log(loginOrEmail, 'loginOrEmail');
    console.log(password, 'password');

    await this.loginPasswordValidatorSizes.validate(loginOrEmail, password);

    const user: UsersEntity = await this.commandBus.execute(
      new ValidatePasswordCommand(loginOrEmail, password),
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

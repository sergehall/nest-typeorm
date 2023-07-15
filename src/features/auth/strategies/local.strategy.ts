import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  loginOrEmailInvalid,
  passwordInvalid,
  validatePasswordFailed,
} from '../../../exception-filter/errors-messages';
import { CommandBus } from '@nestjs/cqrs';
import { ValidatePasswordCommand } from '../application/use-cases/validate-password.use-case';
import { UsersRawSqlEntity } from '../../users/entities/usersRawSql.entity';

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
  ): Promise<UsersRawSqlEntity | null> {
    const messages = [];
    if (
      loginOrEmail.toString().length < 3 ||
      loginOrEmail.toString().length > 20
    ) {
      messages.push(loginOrEmailInvalid);
    }
    if (password.toString().length < 6 || password.toString().length > 20) {
      messages.push(passwordInvalid);
    }
    if (messages.length !== 0) {
      throw new HttpException(
        {
          message: messages,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const user = await this.commandBus.execute(
      new ValidatePasswordCommand(loginOrEmail, password),
    );
    if (!user) {
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

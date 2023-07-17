import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  errorMessageType,
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
    const messages: errorMessageType[] = [];

    this.validateLength(
      loginOrEmail.toString(),
      3,
      20,
      loginOrEmailInvalid,
      messages,
    );
    this.validateLength(password.toString(), 6, 20, passwordInvalid, messages);

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
  private validateLength(
    value: string,
    min: number,
    max: number,
    errorMessage: errorMessageType,
    messages: errorMessageType[],
  ): void {
    if (value.length < min || value.length > max) {
      messages.push(errorMessage);
    }
  }
}

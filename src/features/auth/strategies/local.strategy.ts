import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ValidatePasswordCommand } from '../application/use-cases/validate-password.use-case';

import {
  invalidLoginOrEmailLengthError,
  passwordInvalid,
  validatePasswordFailed,
} from '../../../common/filters/custom-errors-messages';
import { CustomErrorsMessagesType } from '../../../common/filters/types/custom-errors-messages.types';
import { CurrentUserDto } from '../../users/dto/currentUser.dto';

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
    const messages: CustomErrorsMessagesType[] = [];

    this.validateLength(
      loginOrEmail.toString(),
      3,
      50,
      invalidLoginOrEmailLengthError,
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

    return {
      userId: user.userId,
      login: user.login,
      email: user.email,
      orgId: user.orgId,
      roles: user.roles,
      isBanned: user.isBanned,
    };
  }

  private validateLength(
    value: string,
    min: number,
    max: number,
    errorMessage: CustomErrorsMessagesType,
    messages: CustomErrorsMessagesType[],
  ): void {
    if (value.length < min || value.length > max) {
      messages.push(errorMessage);
    }
  }
}

import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ValidatePasswordCommand } from '../application/use-cases/validate-password.use-case';
import { TablesUsersEntity } from '../../users/entities/tables-users.entity';
import {
  invalidLoginOrEmailLengthError,
  passwordInvalid,
  validatePasswordFailed,
} from '../../../common/filters/custom-errors-messages';
import { CustomErrorsMessagesType } from '../../../common/filters/types/custom-errors-messages.types';

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
  ): Promise<TablesUsersEntity | null> {
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
    return user;
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

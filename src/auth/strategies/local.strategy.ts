import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UsersEntity } from '../../users/entities/users.entity';
import {
  loginOrEmailInvalid,
  passwordInvalid,
  validatePasswordFailed,
} from '../../exception-filter/errors-messages';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'loginOrEmail',
    });
  }

  async validate(
    loginOrEmail: string,
    password: string,
  ): Promise<UsersEntity | null> {
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
    const user = await this.authService.validatePassword(
      loginOrEmail,
      password,
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

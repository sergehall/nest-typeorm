import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Ip,
  Post,
  Request,
} from '@nestjs/common';
import { LoginDto } from '../../features/auth/dto/login.dto';
import { CheckingUserExistenceCommand } from '../../features/users/application/use-cases/checking-user-existence.use-case';
import { userAlreadyExists } from '../../exception-filter/errors-messages';
import { RegDataDto } from '../../features/users/dto/reg-data.dto';
import { RegistrationUserCommand } from '../../features/auth/application/use-cases/registration-user.use-case';
import { CommandBus } from '@nestjs/cqrs';

@Controller('auth-pg')
export class AuthPgController {
  constructor(private commandBus: CommandBus) {}

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration')
  async registration(
    @Request() req: any,
    @Body() loginDto: LoginDto,
    @Ip() ip: string,
  ) {
    const userExist = await this.commandBus.execute(
      new CheckingUserExistenceCommand(loginDto.login, loginDto.email),
    );
    if (userExist) {
      throw new HttpException(
        {
          message: [{ ...userAlreadyExists, field: userExist }],
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const registrationData: RegDataDto = {
      ip: ip,
      userAgent: req.get('user-agent') || 'None',
    };
    const newUser = await this.commandBus.execute(
      new RegistrationUserCommand(loginDto, registrationData),
    );

    return {
      id: newUser.id,
      login: newUser.login,
      email: newUser.email,
    };
  }
}

import {
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  HttpCode,
  Body,
  HttpException,
  Ip,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { LoginDto } from '../dto/login.dto';
import { EmailDto } from '../dto/email.dto';
import { CodeDto } from '../dto/code.dto';
import { Response } from 'express';
import { PayloadDto } from '../dto/payload.dto';
import {
  codeIncorrect,
  userAlreadyExists,
} from '../../../exception-filter/errors-messages';
import { SkipThrottle } from '@nestjs/throttler';
import { JwtBlacklistDto } from '../dto/jwt-blacklist.dto';
import { AccessToken } from '../dto/accessToken.dto';
import { CookiesJwtVerificationGuard } from '../guards/cookies-jwt.verification.guard';
import { CommandBus } from '@nestjs/cqrs';
import { RegDataDto } from '../../users/dto/reg-data.dto';
import { RegistrationUserCommand } from './use-cases/registration-user.use-case';
import { UpdateSentConfirmationCodeCommand } from '../../users/application/use-cases/update-sent-confirmation-code.use-case';
import { ConfirmUserByCodeInParamCommand } from './use-cases/confirm-user-byCode-inParam.use-case';
import { CreateDeviceCommand } from '../../security-devices/application/use-cases/create-device.use-case';
import { RemoveDevicesAfterLogoutCommand } from '../../security-devices/application/use-cases/remove-devices-after-logout.use-case';
import { AddRefreshTokenToBlackListCommand } from './use-cases/add-refresh-token-to-blackList.use-case';
import { SignAccessJwtUseCommand } from './use-cases/sign-access-jwt.use-case';
import { UpdateAccessJwtCommand } from './use-cases/update-access-jwt.use-case';
import { SineRefreshJwtCommand } from './use-cases/sine-refresh-jwt.use-case';
import { UpdateRefreshJwtCommand } from './use-cases/update-refresh-jwt.use-case';
import { CheckingUserExistenceCommand } from '../../users/application/use-cases/checking-user-existence.use-case';
import jwt_decode from 'jwt-decode';
import { CurrentUserDto } from '../../users/dto/currentUser.dto';

@SkipThrottle()
@Controller('auth')
export class AuthController {
  constructor(private commandBus: CommandBus) {}
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Request() req: any,
    @Res({ passthrough: true }) res: Response,
    @Ip() ip: string,
  ): Promise<AccessToken> {
    const currentUserDto: CurrentUserDto = req.user;
    const userAgent = req.get('user-agent') || 'None';
    const signedToken = await this.commandBus.execute(
      new SineRefreshJwtCommand(currentUserDto),
    );
    const newPayload: PayloadDto = jwt_decode(signedToken.refreshToken);
    if (newPayload) {
      await this.commandBus.execute(
        new CreateDeviceCommand(newPayload, ip, userAgent),
      );
    }
    res.cookie('refreshToken', signedToken.refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return await this.commandBus.execute(new SignAccessJwtUseCommand(req.user));
  }

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

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration-email-resending')
  async registrationEmailResending(@Body() emailDto: EmailDto) {
    return await this.commandBus.execute(
      new UpdateSentConfirmationCodeCommand(emailDto.email),
    );
  }

  @SkipThrottle()
  @HttpCode(HttpStatus.OK)
  @UseGuards(CookiesJwtVerificationGuard)
  @Post('refresh-token')
  async refreshToken(
    @Request() req: any,
    @Res({ passthrough: true }) res: Response,
    @Ip() ip: string,
  ): Promise<AccessToken> {
    const refreshToken = req.cookies.refreshToken;
    const currentPayload: PayloadDto = jwt_decode(refreshToken);
    const jwtToBlackList = {
      refreshToken: refreshToken,
      expirationDate: new Date(currentPayload.exp * 1000).toISOString(),
    };
    await this.commandBus.execute(
      new AddRefreshTokenToBlackListCommand(jwtToBlackList),
    );
    const newRefreshToken = await this.commandBus.execute(
      new UpdateRefreshJwtCommand(currentPayload),
    );
    const newPayload: PayloadDto = jwt_decode(newRefreshToken.refreshToken);
    const userAgent = req.get('user-agent');
    await this.commandBus.execute(
      new CreateDeviceCommand(newPayload, ip, userAgent),
    );
    res.cookie('refreshToken', newRefreshToken.refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return await this.commandBus.execute(
      new UpdateAccessJwtCommand(currentPayload),
    );
  }

  @SkipThrottle()
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(CookiesJwtVerificationGuard)
  @Post('logout')
  async logout(
    @Request() req: any,
    @Res({ passthrough: true }) res: Response,
  ): Promise<boolean> {
    const refreshToken = req.cookies.refreshToken;
    const payload: PayloadDto = jwt_decode(req.cookies.refreshToken);
    const currentJwt: JwtBlacklistDto = {
      refreshToken: refreshToken,
      expirationDate: new Date(payload.exp * 1000).toISOString(),
    };
    await this.commandBus.execute(
      new AddRefreshTokenToBlackListCommand(currentJwt),
    );
    await this.commandBus.execute(new RemoveDevicesAfterLogoutCommand(payload));
    res.clearCookie('refreshToken');
    return true;
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration-confirmation')
  async registrationConfirmation(@Body() codeDto: CodeDto): Promise<boolean> {
    const result = await this.commandBus.execute(
      new ConfirmUserByCodeInParamCommand(codeDto.code),
    );
    if (!result) {
      throw new HttpException(
        { message: [codeIncorrect] },
        HttpStatus.BAD_REQUEST,
      );
    }
    return true;
  }

  @SkipThrottle()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req: any) {
    return {
      email: req.user.email,
      login: req.user.login,
      userId: req.user.id,
    };
  }
}

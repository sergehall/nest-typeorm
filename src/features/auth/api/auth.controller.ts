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
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { LoginDto } from '../dto/login.dto';
import { EmailDto } from '../dto/email.dto';
import { CodeDto } from '../dto/code.dto';
import { Response } from 'express';
import { PayloadDto } from '../dto/payload.dto';
import { userAlreadyExists } from '../../../exception-filter/errors-messages';
import { SkipThrottle } from '@nestjs/throttler';
import { JwtBlacklistDto } from '../dto/jwt-blacklist.dto';
import { CookiesJwtVerificationGuard } from '../guards/cookies-jwt.verification.guard';
import { CommandBus } from '@nestjs/cqrs';
import { RegDataDto } from '../../users/dto/reg-data.dto';
import { RegistrationUserCommand } from '../application/use-cases/registration-user.use-case';
import { UpdateSentConfirmationCodeCommand } from '../../users/application/use-cases/update-sent-confirmation-code.use-case';
import { ConfirmUserByCodeCommand } from '../application/use-cases/confirm-user-byCode-inParam.use-case';
import { CreateDeviceCommand } from '../../security-devices/application/use-cases/create-device.use-case';
import { RemoveDevicesAfterLogoutCommand } from '../../security-devices/application/use-cases/remove-devices-after-logout.use-case';
import { AddRefreshTokenToBlackListCommand } from '../application/use-cases/add-refresh-token-to-blackList.use-case';
import { SignAccessJwtUseCommand } from '../application/use-cases/sign-access-jwt.use-case';
import { UpdateAccessJwtCommand } from '../application/use-cases/update-access-jwt.use-case';
import { SineRefreshJwtCommand } from '../application/use-cases/sign-refresh-jwt.use-case';
import { UpdateRefreshJwtCommand } from '../application/use-cases/update-refresh-jwt.use-case';
import { CheckingUserExistenceCommand } from '../../users/application/use-cases/checking-user-existence.use-case';
import { ParseQuery } from '../../common/parse-query/parse-query';
import { PasswordRecoveryCommand } from '../application/use-cases/passwordRecovery.use-case';
import { newPasswordRecoveryCommand } from '../application/use-cases/newPasswordRecovery.use-case';
import { AccessTokenDto } from '../dto/access-token.dto';
import { DecodeTokenService } from '../../../config/jwt/decode.service/decode-token-service';
import { NewPasswordRecoveryDto } from '../dto/new-password-recovery.dto';
import { ProfileDto } from '../dto/profile.dto';

@SkipThrottle()
@Controller('auth')
export class AuthController {
  constructor(
    protected commandBus: CommandBus,
    protected decodeTokenService: DecodeTokenService,
  ) {}
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Request() req: any,
    @Res({ passthrough: true }) res: Response,
    @Ip() ip: string,
  ): Promise<AccessTokenDto> {
    const { currentUserDto } = req;
    const userAgent = req.get('user-agent') || 'None';

    const signedToken = await this.commandBus.execute(
      new SineRefreshJwtCommand(currentUserDto),
    );
    const payload: PayloadDto = await this.decodeTokenService.toExtractPayload(
      signedToken.refreshToken,
    );

    await this.commandBus.execute(
      new CreateDeviceCommand(payload, ip, userAgent),
    );
    res.cookie('refreshToken', signedToken.refreshToken);
    // res.cookie('refreshToken', signedToken.refreshToken, {
    //   httpOnly: true,
    //   secure: true,
    // });
    return await this.commandBus.execute(
      new SignAccessJwtUseCommand(currentUserDto),
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration')
  async registration(
    @Request() req: any,
    @Body() loginDto: LoginDto,
    @Ip() ip: string,
  ) {
    const { login, email } = loginDto;

    const userExist = await this.commandBus.execute(
      new CheckingUserExistenceCommand(login, email),
    );
    if (userExist) {
      throw new HttpException(
        { message: [userAlreadyExists] },
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
  ): Promise<AccessTokenDto> {
    const { refreshToken } = req.cookies;

    const currentPayload: PayloadDto =
      await this.decodeTokenService.toExtractPayload(refreshToken);

    const refreshTokenToBlackList = {
      refreshToken: refreshToken,
      expirationDate: new Date(currentPayload.exp * 1000).toISOString(),
    };

    await this.commandBus.execute(
      new AddRefreshTokenToBlackListCommand(refreshTokenToBlackList),
    );

    const newRefreshToken = await this.commandBus.execute(
      new UpdateRefreshJwtCommand(currentPayload),
    );
    const newPayload: PayloadDto =
      await this.decodeTokenService.toExtractPayload(
        newRefreshToken.refreshToken,
      );

    const userAgent = req.get('user-agent');
    await this.commandBus.execute(
      new CreateDeviceCommand(newPayload, ip, userAgent),
    );
    res.cookie('refreshToken', newRefreshToken.refreshToken);
    // res.cookie('refreshToken', newRefreshToken.refreshToken, {
    //   httpOnly: true,
    //   secure: true,
    // });
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
    const { refreshToken } = req.cookies;

    const payload: PayloadDto = await this.decodeTokenService.toExtractPayload(
      refreshToken,
    );
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

  @SkipThrottle()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration-confirmation')
  async registrationConfirmation(@Body() codeDto: CodeDto): Promise<boolean> {
    const { code } = codeDto;
    return await this.commandBus.execute(new ConfirmUserByCodeCommand(code));
  }

  @SkipThrottle()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('password-recovery')
  async passwordRecovery(@Body() emailDto: EmailDto): Promise<boolean> {
    return await this.commandBus.execute(
      new PasswordRecoveryCommand(emailDto.email),
    );
  }
  @SkipThrottle()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('new-password')
  async newPassword(
    @Body() newPasswordRecoveryDto: NewPasswordRecoveryDto,
  ): Promise<boolean> {
    return await this.commandBus.execute(
      new newPasswordRecoveryCommand(newPasswordRecoveryDto),
    );
  }

  @Get('confirm-registration')
  async confirmRegistrationByCodeFromQuery(
    @Query() query: any,
  ): Promise<boolean> {
    const queryData = ParseQuery.getPaginationData(query);
    console.log(
      'Congratulations account is confirmed. Send a message not here, into email that has been confirmed.',
    );
    return await this.commandBus.execute(
      new ConfirmUserByCodeCommand(queryData.code),
    );
  }

  @SkipThrottle()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req: any): ProfileDto {
    const { email, login, id } = req.user;
    return {
      email: email,
      login: login,
      userId: id,
    };
  }
}

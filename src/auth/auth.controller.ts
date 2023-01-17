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
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import { EmailDto } from './dto/email.dto';
import { CodeDto } from './dto/code.dto';
import { Response } from 'express';
import { SecurityDevicesService } from '../security-devices/security-devices.service';
import { PayloadDto } from './dto/payload.dto';
import {
  codeIncorrect,
  userAlreadyExists,
} from '../exception-filter/errors-messages';
import { SkipThrottle } from '@nestjs/throttler';
import { JwtBlacklistDto } from './dto/jwt-blacklist.dto';
import { AccessToken } from './dto/accessToken.dto';
import { CookiesJwtVerificationGuard } from './guards/cookies-jwt.verification.guard';

@SkipThrottle()
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private securityDevicesService: SecurityDevicesService,
  ) {}
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Request() req: any,
    @Res({ passthrough: true }) res: Response,
    @Ip() ip: string,
  ): Promise<AccessToken> {
    const token = await this.authService.signRefreshJWT(req.user);
    const newPayload: PayloadDto = await this.authService.decode(
      token.refreshToken,
    );
    const userAgent = req.get('user-agent') || 'None';
    await this.securityDevicesService.createDevices(newPayload, ip, userAgent);
    // res.cookie('refreshToken', token.refreshToken);
    res.cookie('refreshToken', token.refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return await this.authService.signAccessJWT(req.user);
  }
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration')
  async registration(
    @Request() req: any,
    @Body() loginDto: LoginDto,
    @Ip() ip: string,
  ) {
    const userExist = await this.usersService.userAlreadyExist(
      loginDto.login,
      loginDto.email,
    );
    if (userExist) {
      throw new HttpException(
        {
          message: [userAlreadyExists],
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const userAgent = req.get('user-agent') || 'None';
    const registrationData = {
      ip: ip,
      userAgent: userAgent,
    };
    const newUser = await this.usersService.createUserRegistration(
      loginDto,
      registrationData,
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
    return await this.usersService.updateAndSentConfirmationCodeByEmail(
      emailDto.email,
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
    const currentPayload: PayloadDto = await this.authService.decode(
      refreshToken,
    );
    const jwtBlackList = {
      refreshToken: refreshToken,
      expirationDate: new Date(currentPayload.exp * 1000).toISOString(),
    };
    await this.authService.addRefreshTokenToBl(jwtBlackList);
    const newRefreshToken = await this.authService.updateRefreshJWT(
      currentPayload,
    );
    const newPayload: PayloadDto = await this.authService.decode(
      newRefreshToken.refreshToken,
    );
    const userAgent = req.get('user-agent');
    await this.securityDevicesService.createDevices(newPayload, ip, userAgent);
    res.cookie('refreshToken', newRefreshToken.refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return await this.authService.updateAccessJWT(currentPayload);
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
    const payload: PayloadDto = await this.authService.decode(refreshToken);
    const currentJwt: JwtBlacklistDto = {
      refreshToken: refreshToken,
      expirationDate: new Date(payload.exp * 1000).toISOString(),
    };
    await this.authService.addRefreshTokenToBl(currentJwt);
    await this.securityDevicesService.deleteDeviceByDeviceIdAfterLogout(
      payload,
    );
    res.clearCookie('refreshToken');
    return true;
  }
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration-confirmation')
  async registrationConfirmation(@Body() codeDto: CodeDto): Promise<boolean> {
    const result = await this.usersService.confirmByCodeInParams(codeDto.code);
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

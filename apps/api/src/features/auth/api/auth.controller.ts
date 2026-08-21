import {
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  HttpCode,
  Body,
  Ip,
  HttpStatus,
  Res,
  Query,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { LoginDto } from '../dto/login.dto';
import { EmailDto } from '../dto/email.dto';
import { CodeDto } from '../dto/code.dto';
import { Response } from 'express';
import { CookiesJwtVerificationGuard } from '../guards/cookies-jwt.verification.guard';
import { CommandBus } from '@nestjs/cqrs';
import { RegistrationUserCommand } from '../application/use-cases/registration-user.use-case';
import { UpdateSentConfirmationCodeCommand } from '../../users/application/use-cases/update-sent-confirmation-code.use-case';
import { AccessTokenDto } from '../dto/access-token.dto';
import { NewPasswordRecoveryDto } from '../dto/new-password-recovery.dto';
import { CurrentUserDto } from '../../users/dto/current-user.dto';
import { ConfirmUserByCodeCommand } from '../application/use-cases/confirm-user-by-code.use-case';
import { ChangePasswordByRecoveryCodeCommand } from '../application/use-cases/change-password-by-recovery-code.use-case';
import { PasswordRecoveryCommand } from '../application/use-cases/password-recovery.use-case';
import { ParseQueriesService } from '../../../common/query/parse-queries.service';
import { UserIdEmailLoginDto } from '../dto/profile.dto';
import { RefreshJwtCommand } from '../application/use-cases/refresh-jwt.use-case';
import { LogoutCommand } from '../application/use-cases/logout.use-case';
import { LoginCommand } from '../application/use-cases/login.use-case';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { ApiControllerDocumentation } from '../../../api-documentation/decorators/api-controller-documentation.decorator';
import { ApiConfirmationCodeQuery } from '../../../api-documentation/decorators/api-query-parameters.decorator';
import { LoginRequestDto } from '../dto/login-request.dto';
import { getRefreshTokenCookieOptions } from '../cookies/refresh-token-cookie.options';

@ApiTags('Auth')
@ApiControllerDocumentation()
@Controller('auth')
export class AuthController {
  constructor(
    protected commandBus: CommandBus,
    protected parseQueriesService: ParseQueriesService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @ApiBody({ type: LoginRequestDto })
  @Post('login')
  @Throttle({
    short: { limit: 2, ttl: 1_000 },
    medium: { limit: 5, ttl: 60_000 },
    long: { limit: 20, ttl: 3_600_000 },
  })
  async login(
    @Request() req: any,
    @Res({ passthrough: true }) res: Response,
    @Ip() ip: string,
  ): Promise<AccessTokenDto> {
    const currentUserDto: CurrentUserDto = req.user;

    const userAgent: string = req.get('user-agent') || 'not found user-agent';

    return await this.commandBus.execute(new LoginCommand(currentUserDto, ip, userAgent, res));
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration')
  @Throttle({
    short: { limit: 1, ttl: 1_000 },
    medium: { limit: 3, ttl: 60_000 },
    long: { limit: 10, ttl: 3_600_000 },
  })
  async registration(@Body() loginDto: LoginDto): Promise<UserIdEmailLoginDto> {
    return await this.commandBus.execute(new RegistrationUserCommand(loginDto));
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration-email-resending')
  @Throttle({
    short: { limit: 1, ttl: 1_000 },
    medium: { limit: 3, ttl: 60_000 },
    long: { limit: 6, ttl: 3_600_000 },
  })
  async registrationEmailResending(@Body() emailDto: EmailDto) {
    return await this.commandBus.execute(new UpdateSentConfirmationCodeCommand(emailDto.email));
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(CookiesJwtVerificationGuard)
  @Post('refresh-token')
  @Throttle({
    short: { limit: 3, ttl: 1_000 },
    medium: { limit: 20, ttl: 60_000 },
    long: { limit: 100, ttl: 3_600_000 },
  })
  async refreshToken(
    @Request() req: any,
    @Res({ passthrough: true }) res: Response,
    @Ip() ip: string,
  ): Promise<AccessTokenDto> {
    const refreshTokenDto = req.cookies.refreshToken;

    const userAgent = req.get('user-agent');

    return await this.commandBus.execute(
      new RefreshJwtCommand(refreshTokenDto, ip, userAgent, res),
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration-confirmation')
  @Throttle({
    short: { limit: 2, ttl: 1_000 },
    medium: { limit: 10, ttl: 60_000 },
    long: { limit: 30, ttl: 3_600_000 },
  })
  async registrationConfirmation(@Body() codeDto: CodeDto): Promise<boolean> {
    const { code } = codeDto;
    return await this.commandBus.execute(new ConfirmUserByCodeCommand(code));
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(CookiesJwtVerificationGuard)
  @Post('logout')
  async logout(@Request() req: any, @Res({ passthrough: true }) res: Response): Promise<boolean> {
    const refreshTokenDto: RefreshTokenDto = req.cookies.refreshToken;
    const { refreshToken } = refreshTokenDto;

    await this.commandBus.execute(new LogoutCommand(refreshToken));

    res.clearCookie('refreshToken', getRefreshTokenCookieOptions());
    return true;
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Get('confirm-registration')
  @ApiConfirmationCodeQuery()
  async confirmRegistrationByCodeFromQuery(@Query() query: any): Promise<boolean> {
    const queryData = await this.parseQueriesService.getQueriesData(query);

    return await this.commandBus.execute(new ConfirmUserByCodeCommand(queryData.code));
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('password-recovery')
  @Throttle({
    short: { limit: 1, ttl: 1_000 },
    medium: { limit: 3, ttl: 60_000 },
    long: { limit: 6, ttl: 3_600_000 },
  })
  async passwordRecovery(@Body() emailDto: EmailDto): Promise<boolean> {
    const { email } = emailDto;

    return await this.commandBus.execute(new PasswordRecoveryCommand(email));
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('new-password')
  @Throttle({
    short: { limit: 1, ttl: 1_000 },
    medium: { limit: 5, ttl: 60_000 },
    long: { limit: 15, ttl: 3_600_000 },
  })
  async newPassword(@Body() newPasswordRecoveryDto: NewPasswordRecoveryDto): Promise<boolean> {
    return await this.commandBus.execute(
      new ChangePasswordByRecoveryCodeCommand(newPasswordRecoveryDto),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req: any): Promise<UserIdEmailLoginDto> {
    const { userId, email, login } = req.user;
    return {
      email: email,
      login: login,
      userId: userId,
    };
  }
}

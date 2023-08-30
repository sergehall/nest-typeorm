import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ValidRefreshJwtCommand } from '../application/use-cases/valid-refresh-jwt.use-case';
import { jwtCookiesIncorrect } from '../../../common/filters/custom-errors-messages';
import { InvalidJwtRepo } from '../infrastructure/invalid-jwt-repo';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { validate } from 'class-validator';

@Injectable()
export class CookiesJwtVerificationGuard implements CanActivate {
  constructor(
    protected invalidJwtRepo: InvalidJwtRepo,
    protected commandBus: CommandBus,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const refreshTokenDto: RefreshTokenDto = request.cookies?.['refreshToken'];

    const validationErrors = await validate(refreshTokenDto);

    if (validationErrors.length > 0) {
      throw new HttpException(
        { message: [jwtCookiesIncorrect] },
        HttpStatus.UNAUTHORIZED,
      );
    }
    const { refreshToken } = refreshTokenDto;

    const jwtExistsInBlacklist = await this.invalidJwtRepo.JwtExistInBlackList(
      refreshToken,
    );

    if (!jwtExistsInBlacklist) {
      const validRefreshJwt = await this.commandBus.execute(
        new ValidRefreshJwtCommand(refreshToken),
      );

      return validRefreshJwt !== null;
    } else {
      throw new HttpException(
        { message: [jwtCookiesIncorrect] },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}

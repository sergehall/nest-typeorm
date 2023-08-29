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

@Injectable()
export class CookiesJwtVerificationGuard implements CanActivate {
  constructor(
    protected invalidJwtRepo: InvalidJwtRepo,
    protected commandBus: CommandBus,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const refreshToken = request.cookies?.['refreshToken'];

    if (refreshToken) {
      const jwtExistInBlackList = await this.invalidJwtRepo.JwtExistInBlackList(
        refreshToken,
      );
      if (!jwtExistInBlackList) {
        const validRefreshJwt = await this.commandBus.execute(
          new ValidRefreshJwtCommand(refreshToken),
        );
        return validRefreshJwt !== null;
      }
    }
    throw new HttpException(
      { message: [jwtCookiesIncorrect] },
      HttpStatus.UNAUTHORIZED,
    );
  }
}

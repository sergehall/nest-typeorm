import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { BlacklistJwtRepository } from '../infrastructure/blacklist-jwt.repository';
import { jwtCookiesIncorrect } from '../../exception-filter/errors-messages';
import { CommandBus } from '@nestjs/cqrs';
import { ValidRefreshJwtCommand } from '../application/use-cases/valid-refresh-jwt.use-case';

@Injectable()
export class CookiesJwtVerificationGuard implements CanActivate {
  constructor(
    private blacklistJwtRepository: BlacklistJwtRepository,
    protected commandBus: CommandBus,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const refreshToken = request.cookies?.['refreshToken'];
    if (refreshToken) {
      const verifyJwt = await this.commandBus.execute(
        new ValidRefreshJwtCommand(refreshToken),
      );
      const checkInBL = await this.blacklistJwtRepository.findJWT(refreshToken);
      if (verifyJwt && !checkInBL) {
        return true;
      }
    }
    throw new HttpException(
      { message: [jwtCookiesIncorrect] },
      HttpStatus.UNAUTHORIZED,
    );
  }
}

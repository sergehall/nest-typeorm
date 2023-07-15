import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { jwtCookiesIncorrect } from '../../../exception-filter/errors-messages';
import { CommandBus } from '@nestjs/cqrs';
import { ValidRefreshJwtCommand } from '../application/use-cases/valid-refresh-jwt.use-case';
import { BlacklistJwtRawSqlRepository } from '../infrastructure/raw-sql-repository/blacklist-jwt-raw-sql.repository';

@Injectable()
export class CookiesJwtVerificationGuard implements CanActivate {
  constructor(
    protected blacklistJwtRawSqlRepository: BlacklistJwtRawSqlRepository,
    protected commandBus: CommandBus,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const refreshToken = request.cookies?.['refreshToken'];
    if (refreshToken) {
      const verifyJwt = await this.commandBus.execute(
        new ValidRefreshJwtCommand(refreshToken),
      );
      const checkInBL = await this.blacklistJwtRawSqlRepository.findJWT(
        refreshToken,
      );
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

import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ValidRefreshJwtCommand } from '../application/use-cases/valid-refresh-jwt.use-case';
import { BlacklistJwtRawSqlRepository } from '../infrastructure/blacklist-jwt-raw-sql.repository';
import { jwtCookiesIncorrect } from '../../../common/filters/custom-errors-messages';

@Injectable()
export class CookiesJwtVerificationGuard implements CanActivate {
  constructor(
    protected blacklistJwtRawSqlRepository: BlacklistJwtRawSqlRepository,
    protected commandBus: CommandBus,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const refreshToken = request.cookies?.['refreshToken'];

    const jwtExistInBlackList =
      await this.blacklistJwtRawSqlRepository.JwtExistInBlackList(refreshToken);

    if (refreshToken && !jwtExistInBlackList) {
      await this.commandBus.execute(new ValidRefreshJwtCommand(refreshToken));
      return true;
    }
    throw new HttpException(
      { message: [jwtCookiesIncorrect] },
      HttpStatus.UNAUTHORIZED,
    );
  }
}

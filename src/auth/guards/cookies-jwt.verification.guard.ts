import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { BlacklistJwtRepository } from '../infrastructure/blacklist-jwt.repository';
import { jwtCookiesIncorrect } from '../../exception-filter/errors-messages';

@Injectable()
export class CookiesJwtVerificationGuard implements CanActivate {
  constructor(
    private blacklistJwtRepository: BlacklistJwtRepository,
    private authService: AuthService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const refreshToken = request.cookies?.['refreshToken'];
    if (refreshToken) {
      const verify = await this.authService.validRefreshJWT(refreshToken);
      const checkInBL = await this.blacklistJwtRepository.findJWT(refreshToken);
      if (verify && !checkInBL) {
        return true;
      }
    }
    throw new HttpException(
      { message: [jwtCookiesIncorrect] },
      HttpStatus.UNAUTHORIZED,
    );
  }
}

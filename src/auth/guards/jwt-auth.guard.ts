import {
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  jwtIncorrect,
} from '../../exception-filter/errors-messages';
import { BlacklistJwtRepository } from '../infrastructure/blacklist-jwt.repository';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private blacklistJwtRepository: BlacklistJwtRepository) {
    super();
  }
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // const refreshToken = context.switchToHttp().getRequest().cookies?.[
    //   'refreshToken'
    // ];
    // console.log(user.isBanned, '2----');
    // console.log(refreshToken, 'refreshToken');
    // if (user.isBanned && refreshToken) {
    //   const currentJwt: JwtBlacklistDto = {
    //     refreshToken: refreshToken,
    //     expirationDate: new Date(user.payloadExp * 1000).toISOString(),
    //   };
    //   this.blacklistJwtRepository
    //     .addJWT(currentJwt)
    //     .then((success) => {
    //       console.log(success);
    //       new HttpException(
    //         { message: [forBanNotFound] },
    //         HttpStatus.NOT_FOUND,
    //       );
    //     })
    //     .catch((err) => {
    //       console.log(err);
    //     });
    // }
    if (err || !user) {
      throw (
        err ||
        new HttpException({ message: [jwtIncorrect] }, HttpStatus.UNAUTHORIZED)
      );
    }
    // console.log(user, '----3');
    return user;
  }
}

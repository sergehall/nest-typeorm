import {
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { jwtIncorrect } from '../../../common/filters/custom-errors-messages';

@Injectable()
export class JwtAuthAndActiveGameGuard extends AuthGuard('jwt-active-game') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      throw (
        err ||
        new HttpException({ message: [jwtIncorrect] }, HttpStatus.UNAUTHORIZED)
        // No UNAUTHORIZED user return 401
      );
    }

    // if (!user.activeGameId) {
    //   throw new ForbiddenException(noOpenGameMessage); // No active game found, return 403
    // }
    return user;
  }
}

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { AuthService } from '../application/auth.service';
import { BlacklistJwtRepository } from '../infrastructure/blacklist-jwt.repository';
import { UsersService } from '../../users/application/users.service';
import { CommandBus } from '@nestjs/cqrs';
import { ValidAccessJwtCommand } from '../application/use-cases/valid-access-jwt.use-case';

@Injectable()
export class NoneStatusGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private blacklistJwtRepository: BlacklistJwtRepository,
    private usersService: UsersService,
    protected commandBus: CommandBus,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    if (!request.headers || !request.headers.authorization) {
      request.user = null;
      return true;
    }
    const accessToken = request.headers.authorization.split(' ')[1];
    const checkInBL = await this.blacklistJwtRepository.findJWT(accessToken);
    const payload = await this.commandBus.execute(
      new ValidAccessJwtCommand(accessToken),
    );
    if (!checkInBL && payload) {
      const user = await this.usersService.findUserByUserId(payload.userId);
      if (user && !user.banInfo?.isBanned) {
        request.user = {
          id: user.id,
          login: user.login,
          email: user.email,
          banInfo: { isBanned: user.banInfo.isBanned },
          payloadExp: new Date(payload.exp * 1000).toISOString(),
        };
      }
      return true;
    }
    request.user = null;
    return true;
  }
}

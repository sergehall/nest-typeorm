import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UsersService } from '../../users/application/users.service';
import { CommandBus } from '@nestjs/cqrs';
import { ValidAccessJwtCommand } from '../application/use-cases/valid-access-jwt.use-case';
import { BlacklistJwtRawSqlRepository } from '../infrastructure/blacklist-jwt-raw-sql.repository';
import { PayloadDto } from '../dto/payload.dto';

@Injectable()
export class NoneStatusGuard implements CanActivate {
  constructor(
    protected blacklistJwtRawSqlRepository: BlacklistJwtRawSqlRepository,
    protected usersService: UsersService,
    protected commandBus: CommandBus,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    if (request.headers && request.headers.authorization) {
      const accessToken = request.headers.authorization.split(' ')[1];

      const jwtExistInBlackList: boolean =
        await this.blacklistJwtRawSqlRepository.JwtExistInBlackList(
          accessToken,
        );

      const payload: PayloadDto = await this.commandBus.execute(
        new ValidAccessJwtCommand(accessToken),
      );

      if (!jwtExistInBlackList && payload) {
        const user = await this.usersService.findUserByUserId(payload.userId);
        if (user && !user.isBanned) {
          request.user = {
            id: user.id,
            login: user.login,
            email: user.email,
            orgId: user.orgId,
            roles: user.roles,
            isBanned: user.isBanned,
            payloadExp: new Date(payload.exp * 1000).toISOString(),
          };
        }
        return true;
      }
    }

    request.user = null;
    return true;
  }
}

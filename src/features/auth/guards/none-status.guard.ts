import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ValidAccessJwtCommand } from '../application/use-cases/valid-access-jwt.use-case';
import { PayloadDto } from '../dto/payload.dto';
import { UsersRepo } from '../../users/infrastructure/users-repo';
import { InvalidJwtRepo } from '../infrastructure/invalid-jwt-repo';

@Injectable()
export class NoneStatusGuard implements CanActivate {
  constructor(
    protected invalidJwtRepo: InvalidJwtRepo,
    protected usersRepo: UsersRepo,
    protected commandBus: CommandBus,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    if (request.headers && request.headers.authorization) {
      const accessToken = request.headers.authorization.split(' ')[1];

      const payload: PayloadDto = await this.commandBus.execute(
        new ValidAccessJwtCommand(accessToken),
      );

      const jwtExistInBlackList: boolean =
        await this.invalidJwtRepo.JwtExistInBlackList(accessToken);

      if (!jwtExistInBlackList && payload) {
        const user = await this.usersRepo.findUserById(payload.userId);

        request.user =
          user && !user.isBanned
            ? {
                id: user.userId,
                login: user.login,
                email: user.email,
                orgId: user.orgId,
                roles: user.roles,
                isBanned: user.isBanned,
              }
            : null;
        return true;
      }
    }

    request.user = null;
    return true;
  }
}

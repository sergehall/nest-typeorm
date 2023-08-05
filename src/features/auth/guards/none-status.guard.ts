import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UsersService } from '../../users/application/users.service';
import { CommandBus } from '@nestjs/cqrs';
import { ValidAccessJwtCommand } from '../application/use-cases/valid-access-jwt.use-case';
import { BlacklistJwtRawSqlRepository } from '../infrastructure/blacklist-jwt-raw-sql.repository';
import { PayloadDto } from '../dto/payload.dto';
import { TablesUsersWithIdEntity } from '../../users/entities/tables-user-with-id.entity';

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

      const payload: PayloadDto = await this.commandBus.execute(
        new ValidAccessJwtCommand(accessToken),
      );

      const jwtExistInBlackList: boolean =
        await this.blacklistJwtRawSqlRepository.JwtExistInBlackList(
          accessToken,
        );

      if (!jwtExistInBlackList && payload) {
        const user: TablesUsersWithIdEntity | null =
          await this.usersService.findUserByUserId(payload.userId);

        request.user =
          user && !user.isBanned
            ? {
                id: user.id,
                login: user.login,
                email: user.email,
                orgId: user.orgId,
                roles: user.roles,
                isBanned: user.isBanned,
                payloadExp: new Date(payload.exp * 1000).toISOString(),
              }
            : null;
        return true;
      }
    }

    request.user = null;
    return true;
  }
}

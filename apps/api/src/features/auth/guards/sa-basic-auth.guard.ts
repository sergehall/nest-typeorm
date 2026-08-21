import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  HttpException,
  HttpStatus,
  ServiceUnavailableException,
} from '@nestjs/common';
import { timingSafeEqual } from 'node:crypto';
import { SaConfig } from '../../../config/sa/sa.config';
import {
  loginOrPassInvalid,
  noAuthHeadersError,
} from '../../../common/filters/custom-errors-messages';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from '../../../config/configuration';
import { UsersRepo } from '../../users/infrastructure/users-repo';
import { CommandBus } from '@nestjs/cqrs';
import { CreateSaUserCommand } from '../../sa/application/use-cases/sa-create-super-admin.use-case';
import { isLocalRuntime } from '../../../common/environment/runtime-environment';

@Injectable()
export class SaBasicAuthGuard extends SaConfig implements CanActivate {
  private readonly usersRepo: UsersRepo;
  private readonly commandBus: CommandBus;

  constructor(
    commandBus: CommandBus,
    usersRepo: UsersRepo,
    configService: ConfigService<ConfigType, true>,
  ) {
    super(configService);
    this.commandBus = commandBus;
    this.usersRepo = usersRepo;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const expectedBasicAuthInput = await this.getSaValue('BASIC_AUTH');

    const expectedInputAuthorization = `Basic ${expectedBasicAuthInput}`;

    if (!request.headers || !request.headers.authorization) {
      throw new UnauthorizedException([noAuthHeadersError]);
    } else {
      const actualAuthorization = Buffer.from(request.headers.authorization);
      const expectedAuthorization = Buffer.from(expectedInputAuthorization);
      if (
        actualAuthorization.length !== expectedAuthorization.length ||
        !timingSafeEqual(actualAuthorization, expectedAuthorization)
      ) {
        throw new HttpException(
          {
            message: [loginOrPassInvalid],
          },
          HttpStatus.UNAUTHORIZED,
        );
      }
      const saLogin = await this.getSaValue('SA_LOGIN');
      let saUser = await this.usersRepo.findSaUserByLoginOrEmail(saLogin);

      if (!saUser && isLocalRuntime()) {
        saUser = await this.commandBus.execute(new CreateSaUserCommand());
      }

      if (!saUser) {
        throw new ServiceUnavailableException('Administrative account is not initialized.');
      }

      request.user = {
        userId: saUser.userId,
        login: saUser.login,
        email: saUser.email,
        orgId: saUser.orgId,
        roles: saUser.roles,
        isBanned: saUser.isBanned,
      };

      return true;
    }
  }
}

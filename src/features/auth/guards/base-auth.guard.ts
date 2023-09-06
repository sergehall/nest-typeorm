import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { SaConfig } from '../../../config/sa/sa-config';
import {
  loginOrPassInvalid,
  noAuthHeadersError,
} from '../../../common/filters/custom-errors-messages';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from '../../../config/configuration';
import { UsersEntity } from '../../users/entities/users.entity';
import { SaCreateSuperAdmin } from '../../sa/application/use-cases/sa-create-super-admin.use-case';

@Injectable()
export class BaseAuthGuard extends SaConfig implements CanActivate {
  private readonly saCreateSuperAdmin: SaCreateSuperAdmin; // Declare a private property to store the CommandBus instance
  constructor(
    saCreateSuperAdmin: SaCreateSuperAdmin,
    configService: ConfigService<ConfigType, true>,
  ) {
    super(configService);
    this.saCreateSuperAdmin = saCreateSuperAdmin; // Store the CommandBus instance
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const basicAuth = await this.getBasicAuth('BASIC_AUTH');
    const exceptedAuthInput = 'Basic ' + basicAuth;

    if (!request.headers || !request.headers.authorization) {
      throw new UnauthorizedException([noAuthHeadersError]);
    } else {
      if (request.headers.authorization != exceptedAuthInput) {
        throw new HttpException(
          {
            message: [loginOrPassInvalid],
          },
          HttpStatus.UNAUTHORIZED,
        );
      }
      const sa: UsersEntity = await this.saCreateSuperAdmin.create();

      request.user = {
        userId: sa.userId,
        login: sa.login,
        email: sa.email,
        orgId: sa.orgId,
        roles: sa.roles,
        isBanned: sa.isBanned,
      };
      return true;
    }
  }
}

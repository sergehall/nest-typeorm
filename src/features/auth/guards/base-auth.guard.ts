import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';

import {
  loginOrPassInvalid,
  moAnyAuthHeaders,
} from '../../../exception-filter/errors-messages';
import { User } from '../../users/infrastructure/schemas/user.schema';
import { OrgIdEnums } from '../../../infrastructure/database/enums/org-id.enums';
import { Role } from '../../../ability/roles/role.enum';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from '../../../config/configuration';

@Injectable()
export class BaseAuthGuard implements CanActivate {
  constructor(private configService: ConfigService<ConfigType, true>) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const exceptedAuthInput =
      'Basic ' + this.configService.get('auth').BASIC_AUTH;
    if (!request.headers || !request.headers.authorization) {
      throw new UnauthorizedException([moAnyAuthHeaders]);
    } else {
      if (request.headers.authorization != exceptedAuthInput) {
        throw new HttpException(
          {
            message: [loginOrPassInvalid],
          },
          HttpStatus.UNAUTHORIZED,
        );
      }
      const saUser = new User();
      saUser.id = 'saUser';
      saUser.login = 'admin';
      saUser.email = 'saUser@email.com';
      saUser.orgId = OrgIdEnums.IT_INCUBATOR;
      saUser.roles = Role.SA;
      const banInfo = { isBanned: false };
      request.user = { ...saUser, banInfo };
      return true;
    }
  }
}
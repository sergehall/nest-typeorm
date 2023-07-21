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
import { OrgIdEnums } from '../../users/enums/org-id.enums';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from '../../../config/configuration';
import { RolesEnums } from '../../../ability/enums/roles.enums';
import { CurrentUserDto } from '../../users/dto/currentUser.dto';

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
      const saUser: CurrentUserDto = new CurrentUserDto();
      saUser.id = 'id.SA';
      saUser.login = 'login.SA';
      saUser.email = 'SA@email.com';
      saUser.orgId = OrgIdEnums.IT_INCUBATOR;
      saUser.roles = RolesEnums.SA;
      saUser.isBanned = false;
      saUser.payloadExp = 'infinity.SA';
      request.user = { ...saUser };
      return true;
    }
  }
}

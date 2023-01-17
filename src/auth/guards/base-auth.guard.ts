import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import * as process from 'process';
import {
  loginOrPassInvalid,
  moAnyAuthHeaders,
} from '../../exception-filter/errors-messages';
import { User } from '../../users/infrastructure/schemas/user.schema';
import { OrgIdEnums } from '../../infrastructure/database/enums/org-id.enums';
import { Role } from '../../ability/roles/role.enum';

@Injectable()
export class BaseAuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const exceptedAuthInput = 'Basic ' + process.env.BASIC_AUTH;
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
      saUser.orgId = OrgIdEnums.IT_INCUBATOR;
      saUser.roles = Role.SA;
      request.user = saUser;
      return true;
    }
  }
}

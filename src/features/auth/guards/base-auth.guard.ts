import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { userSuperAdmin } from '../../sa/dto/super-admin.dto';
import { BaseConfig } from '../../../config/base/base-config';
import {
  loginOrPassInvalid,
  noAuthHeadersError,
} from '../../../exception-filter/custom-errors-messages';

@Injectable()
export class BaseAuthGuard extends BaseConfig implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const basicAuth = await this.getValueBasicAuth('BASIC_AUTH');
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
      request.user = userSuperAdmin;
      return true;
    }
  }
}

import { applyDecorators, Injectable } from '@nestjs/common';
import { UsersDecoratorsService } from './decorators-service/users-decorators-service';
import { SuperAdminDecoratorsService } from './decorators-service/super-admin-decorators-service';
import { BloggerDecoratorsService } from './decorators-service/blogger-decorators-service';
import { AuthDecoratorsService } from './decorators-service/auth-decorators-service';
import { EndpointKeys } from './enums/endpoint-keys.enum';

@Injectable()
export class ApiDocService {
  constructor() {}

  static apply(
    endpointKeys: EndpointKeys,
    method: string,
    description?: string,
  ) {
    switch (endpointKeys) {
      case EndpointKeys.SA:
        return SuperAdminDecoratorsService.getDecorator(method, description);
      case EndpointKeys.Users:
        return UsersDecoratorsService.getDecorator(method, description);
      case EndpointKeys.Blogger:
        return BloggerDecoratorsService.getDecorator(method, description);
      case EndpointKeys.Auth:
        return AuthDecoratorsService.getDecorator(method, description);

      default:
        // If no key matches, return an empty set of swagger
        return applyDecorators();
    }
  }
}

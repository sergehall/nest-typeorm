import { applyDecorators, Injectable } from '@nestjs/common';
import { UsersDecoratorsService } from './decorators-service/users-decorators-service';
import { SuperAdminDecoratorsService } from './decorators-service/super-admin-decorators-service';
import { BloggerDecoratorsService } from './decorators-service/blogger-decorators-service';
import { AuthDecoratorsService } from './decorators-service/auth-decorators-service';
import { Keys } from './enums/keys.enum';

@Injectable()
export class ApiDocService {
  constructor() {}

  static apply(key: Keys, method: string, description?: string) {
    switch (key) {
      case Keys.Users:
        return UsersDecoratorsService.getDecorator(method, description);
      case Keys.SA:
        return SuperAdminDecoratorsService.getDecorator(method, description);
      case Keys.Blogger:
        return BloggerDecoratorsService.getDecorator(method, description);
      case Keys.Auth:
        return AuthDecoratorsService.getDecorator(method, description);

      default:
        // If no key matches, return an empty set of swagger
        return applyDecorators();
    }
  }
}

import { Module } from '@nestjs/common';
import { UsersDecoratorsService } from './decorators-service/users-decorators-service';
import { SuperAdminDecoratorsService } from './decorators-service/super-admin-decorators-service';
import { BloggerDecoratorsService } from './decorators-service/blogger-decorators-service';
import { ApiDocService } from './api-doc-service';

@Module({
  providers: [
    ApiDocService,
    UsersDecoratorsService,
    SuperAdminDecoratorsService,
    BloggerDecoratorsService,
  ],
  exports: [ApiDocService],
})
export class ApiDocumentationModule {}

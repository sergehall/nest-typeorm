import { configModule } from './config/configModule';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { TestingModule } from './testing/testing.module';
import { LoggerMiddleware } from './logger/middleware';
import { CommentsController } from './comments/comments.controller';
import { PostsController } from './posts/posts.controller';
import { UsersController } from './users/application/users.controller';
import { CaslModule } from './ability/casl.module';
import { SecurityDevicesModule } from './security-devices/security-devices.module';
import { SecurityDevicesController } from './security-devices/security-devices.controller';
import { AuthController } from './auth/auth.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { DemonsModule } from './demons/demons.module';
import { MailsModule } from './mails/mails.module';
import { TestingController } from './testing/testing.controller';
import { ThrottlerModule } from '@nestjs/throttler';
import { appProviders } from './app.providers';
import { SaModule } from './sa/sa.module';
import { BloggerBlogsController } from './blogger-blogs/blogger-blogs.controller';
import { SaController } from './sa/sa.controller';
import { BlogsModule } from './blogs/blogs.module';
import { BloggerBlogsModule } from './blogger-blogs/blogger-blogs.module';
import { getConfiguration } from './config/configuration';

@Module({
  imports: [
    configModule,
    ThrottlerModule.forRoot({
      ttl: getConfiguration().throttle.THROTTLE_TTL,
      limit: getConfiguration().throttle.THROTTLE_LIMIT,
    }),
    ScheduleModule.forRoot(),
    UsersModule,
    PostsModule,
    CommentsModule,
    TestingModule,
    AuthModule,
    CaslModule,
    SecurityDevicesModule,
    DemonsModule,
    MailsModule,
    BlogsModule,
    SaModule,
    BloggerBlogsModule,
  ],
  controllers: [AppController],
  providers: [AppService, ...appProviders],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes(
        AuthController,
        SaController,
        CommentsController,
        PostsController,
        UsersController,
        SecurityDevicesController,
        BloggerBlogsController,
        TestingController,
      );
  }
}

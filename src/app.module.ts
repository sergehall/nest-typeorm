import { configModule } from './config/configModule';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './features/auth/auth.module';
import { UsersModule } from './features/users/users.module';
import { PostsModule } from './features/posts/posts.module';
import { CommentsModule } from './features/comments/comments.module';
import { TestingModule } from './features/testing/testing.module';
import { LoggerMiddleware } from './logger/middleware';
import { CommentsController } from './features/comments/application/comments.controller';
import { PostsController } from './features/posts/application/posts.controller';
import { UsersController } from './features/users/application/users.controller';
import { CaslModule } from './ability/casl.module';
import { SecurityDevicesModule } from './features/security-devices/security-devices.module';
import { SecurityDevicesController } from './features/security-devices/application/security-devices.controller';
import { AuthController } from './features/auth/application/auth.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { DemonsModule } from './features/demons/demons.module';
import { MailsModule } from './features/mails/mails.module';
import { TestingController } from './features/testing/testing.controller';
import { ThrottlerModule } from '@nestjs/throttler';
import { appProviders } from './app.providers';
import { SaModule } from './features/sa/sa.module';
import { BloggerBlogsController } from './features/blogger-blogs/application/blogger-blogs.controller';
import { SaController } from './features/sa/application/sa.controller';
import { BlogsModule } from './features/blogs/blogs.module';
import { BloggerBlogsModule } from './features/blogger-blogs/blogger-blogs.module';
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

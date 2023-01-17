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
import { UsersController } from './users/users.controller';
import { CaslModule } from './ability/casl.module';
import { ConfigModule } from '@nestjs/config';
import { SecurityDevicesModule } from './security-devices/security-devices.module';
import { SecurityDevicesController } from './security-devices/security-devices.controller';
import { AuthController } from './auth/auth.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { DemonsModule } from './demons/demons.module';
import { MailsModule } from './mails/mails.module';
import { TestingController } from './testing/testing.controller';
import { ThrottlerModule } from '@nestjs/throttler';
import { appProviders } from './app.providers';
import { BBlogsModule } from './bblogger/bblogs.module';
import { SaModule } from './sa/sa.module';
import * as process from 'process';
import { BBlogsController } from './bblogger/bblogs.controller';
import { SaController } from './sa/sa.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [],
    }),
    ThrottlerModule.forRoot({
      ttl: Number(process.env.THROTTLE_TTL),
      limit: Number(process.env.THROTTLE_LIMIT),
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
    BBlogsModule,
    SaModule,
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
        BBlogsController,
        TestingController,
      );
  }
}

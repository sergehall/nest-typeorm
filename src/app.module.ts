import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import AppConfigModuleOptions from './config/app-module.configuration';
import { appProviders } from './app.providers';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './features/auth/auth.module';
import { UsersModule } from './features/users/users.module';
import { PostsModule } from './features/posts/posts.module';
import { CommentsModule } from './features/comments/comments.module';
import { TestingModule } from './features/testing/testing.module';
import { LoggerMiddleware } from './logger/middleware';
import { CaslModule } from './ability/casl.module';
import { SecurityDevicesModule } from './features/security-devices/security-devices.module';
import { ScheduleModule } from '@nestjs/schedule';
import { DemonsModule } from './features/demons/demons.module';
import { MailsModule } from './features/mails/mails.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { SaModule } from './features/sa/sa.module';
import { BlogsModule } from './features/blogs/blogs.module';
import { BloggerBlogsModule } from './features/blogger-blogs/blogger-blogs.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { OrmModuleOptions } from './config/db/postgres/orm-module-options';
import { ThrottlerOptions } from './config/throttle/throttler-options';

@Module({
  imports: [
    ConfigModule.forRoot(AppConfigModuleOptions),
    TypeOrmModule.forRootAsync({
      useClass: OrmModuleOptions, // Use the OrmOptions class as the factory
    }),
    ThrottlerModule.forRootAsync({
      useClass: ThrottlerOptions, // Use the ThrottlerModuleOptions class as the factory
    }),
    ScheduleModule.forRoot(),
    CaslModule,
    UsersModule,
    PostsModule,
    CommentsModule,
    TestingModule,
    AuthModule,
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
    consumer.apply(LoggerMiddleware).forRoutes('*'); // Apply logger middleware to all routes
  }
}

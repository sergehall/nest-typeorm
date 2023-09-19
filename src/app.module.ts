import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
// import AppConfigModuleOptions from './config/app-module.configuration';
import { appProviders } from './app.providers';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './features/auth/auth.module';
import { UsersModule } from './features/users/users.module';
import { PostsModule } from './features/posts/posts.module';
import { CommentsModule } from './features/comments/comments.module';
import { TestingModule } from './features/testing/testing.module';
import { CaslModule } from './ability/casl.module';
import { SecurityDevicesModule } from './features/security-devices/security-devices.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulingModule } from './scheduling/scheduling.module';
import { MailsModule } from './mails/mails.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { SaModule } from './features/sa/sa.module';
import { BlogsModule } from './features/blogs/blogs.module';
import { BloggerBlogsModule } from './features/blogger-blogs/blogger-blogs.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerOptions } from './config/throttle/throttler-options';
import { HttpLoggingMiddleware } from './middlewares/http-logging.middleware';
import { DataCleanupModule } from './data-cleanup/data-cleanup.module';
import { AppTypeOrmModuleOptions } from './config/db/type-orm-options/app-type-orm-module.options';
import { CustomConfigModule } from './config/custom.config-module';
import { QuizQuestionsModule } from './features/quiz-questions/quiz-questions.module';

@Module({
  imports: [
    CustomConfigModule,
    TypeOrmModule.forRootAsync({
      useClass: AppTypeOrmModuleOptions, // Use the OrmOptions class as the factory
    }),
    ThrottlerModule.forRootAsync({
      useClass: ThrottlerOptions, // Use the ThrottlerModuleOptions class as the factory
    }),
    ScheduleModule.forRoot(),
    CaslModule,
    AuthModule,
    SaModule,
    UsersModule,
    BlogsModule,
    PostsModule,
    CommentsModule,
    SchedulingModule,
    MailsModule,
    BloggerBlogsModule,
    SecurityDevicesModule,
    TestingModule,
    DataCleanupModule,
    QuizQuestionsModule,
  ],
  controllers: [AppController],
  providers: [AppService, ...appProviders],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggingMiddleware).forRoutes('*'); // Apply logger middleware to all routes
  }
}

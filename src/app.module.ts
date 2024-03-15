import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
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
import { SchedulingModule } from './common/scheduling/scheduling.module';
import { MailsModule } from './common/mails/mails.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { SaModule } from './features/sa/sa.module';
import { BlogsModule } from './features/blogs/blogs.module';
import { BloggerBlogsModule } from './features/blogger-blogs/blogger-blogs.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerOptions } from './config/throttle/throttler-options';
import { HttpLoggingMiddleware } from './middlewares/http-logging.middleware';
import { DataCleanupModule } from './common/data-cleanup/data-cleanup.module';
import { CustomConfigModule } from './config/custom.config-module';
import { SaQuizQuestionsModule } from './features/sa-quiz-questions/sa-quiz-questions.module';
import { PairGameQuizModule } from './features/pair-game-quiz/pair-game-quiz.module';
import { TypeOrmPostgresOptions } from './db/type-orm/options/type-orm-postgres.options';
import { TelegramModule } from './features/telegram/telegram.module';
import { TelegramAdapter } from './adapters/telegram/telegram.adapter';
import { TelegramConfig } from './config/telegram/telegram.config';
import { PostgresConfig } from './config/db/postgres/postgres.config';
import { CqrsModule } from '@nestjs/cqrs';
import { StripeModule } from './features/stripe/stripe.module';

@Module({
  imports: [
    CustomConfigModule,
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmPostgresOptions, // Use the OrmOptions class as the factory
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
    SaQuizQuestionsModule,
    PairGameQuizModule,
    TelegramModule,
    CqrsModule,
    StripeModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    TelegramAdapter,
    TelegramConfig,
    PostgresConfig,
    ...appProviders,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggingMiddleware).forRoutes('*'); // Apply logger middleware to all routes
  }
}

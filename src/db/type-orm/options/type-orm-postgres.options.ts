import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { PostgresConfig } from '../../../config/db/postgres/postgres.config';
import { UsersEntity } from '../../../features/users/entities/users.entity';
import { SecurityDevicesEntity } from '../../../features/security-devices/entities/session-devices.entity';
import { BloggerBlogsEntity } from '../../../features/blogger-blogs/entities/blogger-blogs.entity';
import { CommentsEntity } from '../../../features/comments/entities/comments.entity';
import { PostsEntity } from '../../../features/posts/entities/posts.entity';
import { LikeStatusPostsEntity } from '../../../features/posts/entities/like-status-posts.entity';
import { LikeStatusCommentsEntity } from '../../../features/comments/entities/like-status-comments.entity';
import { InvalidJwtEntity } from '../../../features/auth/entities/invalid-jwt.entity';
import { SentCodesLogEntity } from '../../../common/mails/infrastructure/entities/sent-codes-log.entity';
import { BannedUsersForBlogsEntity } from '../../../features/users/entities/banned-users-for-blogs.entity';
import { QuestionsQuizEntity } from '../../../features/sa-quiz-questions/entities/questions-quiz.entity';
import { ChallengeQuestionsEntity } from '../../../features/pair-game-quiz/entities/challenge-questions.entity';
import { ChallengeAnswersEntity } from '../../../features/pair-game-quiz/entities/challenge-answers.entity';
import { PairsGameEntity } from '../../../features/pair-game-quiz/entities/pairs-game.entity';
import { ImagesBlogsWallpaperMetadataEntity } from '../../../features/blogger-blogs/entities/images-blog-wallpaper-metadata.entity';
import { ImagesBlogsMainMetadataEntity } from '../../../features/blogger-blogs/entities/images-blog-main-metadata.entity';
import { ImagesPostsOriginalMetadataEntity } from '../../../features/posts/entities/images-post-original-metadata.entity';
import { ImagesPostsMiddleMetadataEntity } from '../../../features/posts/entities/images-posts-middle-metadata.entity';
import { ImagesPostsSmallMetadataEntity } from '../../../features/posts/entities/images-posts-small-metadata.entity';
import { BlogsSubscribersEntity } from '../../../features/blogger-blogs/entities/blogs-subscribers.entity';
import { TelegramBotStatusEntity } from '../../../features/telegram/entities/telegram-bot-status.entity';
import { ProductsDataEntity } from '../../../common/products/entities/products-data.entity';
import { OrdersEntity } from '../../../common/products/entities/orders.entity';
import { PaymentTransactionsEntity } from '../../../common/products/entities/payment-transaction.entity';
import { OrderItemsEntity } from '../../../common/products/entities/order-items.entity';
import { GuestUsersEntity } from '../../../common/products/entities/unregistered-users.entity';

@Injectable()
export class TypeOrmPostgresOptions
  extends PostgresConfig
  implements TypeOrmOptionsFactory
{
  async createTypeOrmOptions(): Promise<TypeOrmModuleOptions> {
    const host = await this.getHost('PG_HOST_HEROKU');
    const port = await this.getPort('PG_PORT');
    const username = await this.getAuth('PG_HEROKU_USER_NAME');
    const password = await this.getAuth('PG_HEROKU_USER_PASSWORD');
    const database = await this.getNamesDatabase('PG_HEROKU_NAME_DATABASE');

    return {
      type: 'postgres',
      host,
      port,
      username,
      password,
      database,
      autoLoadEntities: true,
      ssl: { rejectUnauthorized: false },
      entities: [
        UsersEntity,
        GuestUsersEntity,
        SecurityDevicesEntity,
        BloggerBlogsEntity,
        BlogsSubscribersEntity,
        PostsEntity,
        CommentsEntity,
        BannedUsersForBlogsEntity,
        LikeStatusPostsEntity,
        OrdersEntity,
        OrderItemsEntity,
        PaymentTransactionsEntity,
        LikeStatusCommentsEntity,
        InvalidJwtEntity,
        SentCodesLogEntity,
        QuestionsQuizEntity,
        PairsGameEntity,
        ProductsDataEntity,
        ChallengeQuestionsEntity,
        ChallengeAnswersEntity,
        TelegramBotStatusEntity,
        ImagesBlogsMainMetadataEntity,
        ImagesBlogsWallpaperMetadataEntity,
        ImagesPostsOriginalMetadataEntity,
        ImagesPostsMiddleMetadataEntity,
        ImagesPostsSmallMetadataEntity,
      ],
      synchronize: true,
      logging: false,
    };
  }
}

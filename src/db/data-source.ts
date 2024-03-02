import { UsersEntity } from '../features/users/entities/users.entity';
import { SecurityDevicesEntity } from '../features/security-devices/entities/session-devices.entity';
import { BloggerBlogsEntity } from '../features/blogger-blogs/entities/blogger-blogs.entity';
import { PostsEntity } from '../features/posts/entities/posts.entity';
import { CommentsEntity } from '../features/comments/entities/comments.entity';
import { BannedUsersForBlogsEntity } from '../features/users/entities/banned-users-for-blogs.entity';
import { LikeStatusPostsEntity } from '../features/posts/entities/like-status-posts.entity';
import { LikeStatusCommentsEntity } from '../features/comments/entities/like-status-comments.entity';
import { InvalidJwtEntity } from '../features/auth/entities/invalid-jwt.entity';
import { SentCodesLogEntity } from '../common/mails/infrastructure/entities/sent-codes-log.entity';
import { DataSource } from 'typeorm';
import 'dotenv/config';
import { PairsGameEntity } from '../features/pair-game-quiz/entities/pairs-game.entity';
import { ChallengeQuestionsEntity } from '../features/pair-game-quiz/entities/challenge-questions.entity';
import { QuestionsQuizEntity } from '../features/sa-quiz-questions/entities/questions-quiz.entity';
import { ChallengeAnswersEntity } from '../features/pair-game-quiz/entities/challenge-answers.entity';
import { ImagesBlogsWallpaperMetadataEntity } from '../features/blogger-blogs/entities/images-blog-wallpaper-metadata.entity';
import { ImagesBlogsMainMetadataEntity } from '../features/blogger-blogs/entities/images-blog-main-metadata.entity';
import { ImagesPostsOriginalMetadataEntity } from '../features/posts/entities/images-post-original-metadata.entity';
import { ImagesPostsSmallMetadataEntity } from '../features/posts/entities/images-posts-small-metadata.entity';
import { ImagesPostsMiddleMetadataEntity } from '../features/posts/entities/images-posts-middle-metadata.entity';
import { BlogsSubscribersEntity } from '../features/blogger-blogs/entities/blogs-subscribers.entity';

export default new DataSource({
  type: 'postgres',
  host: process.env.PG_HOST_HEROKU,
  port: parseInt(process.env.PG_HOST_HEROKU as string, 10) || 5432,
  username: process.env.PG_HEROKU_USER_NAME,
  password: process.env.PG_HEROKU_USER_PASSWORD,
  database: process.env.PG_HEROKU_NAME_DATABASE,
  ssl: { rejectUnauthorized: false },
  migrationsTableName: 'migrationsNest',
  entities: [
    UsersEntity,
    SecurityDevicesEntity,
    BloggerBlogsEntity,
    BlogsSubscribersEntity,
    PostsEntity,
    CommentsEntity,
    BannedUsersForBlogsEntity,
    LikeStatusPostsEntity,
    LikeStatusCommentsEntity,
    InvalidJwtEntity,
    SentCodesLogEntity,
    PairsGameEntity,
    ChallengeQuestionsEntity,
    QuestionsQuizEntity,
    ChallengeAnswersEntity,
    ImagesBlogsMainMetadataEntity,
    ImagesBlogsWallpaperMetadataEntity,
    ImagesPostsOriginalMetadataEntity,
    ImagesPostsMiddleMetadataEntity,
    ImagesPostsSmallMetadataEntity,
  ],
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'], // Specify the path to your migrations
});

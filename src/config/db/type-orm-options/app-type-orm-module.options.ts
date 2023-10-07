import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { PostgresConfig } from '../postgres/postgres.config';
import { UsersEntity } from '../../../features/users/entities/users.entity';
import { SecurityDevicesEntity } from '../../../features/security-devices/entities/session-devices.entity';
import { BloggerBlogsEntity } from '../../../features/blogger-blogs/entities/blogger-blogs.entity';
import { CommentsEntity } from '../../../features/comments/entities/comments.entity';
import { PostsEntity } from '../../../features/posts/entities/posts.entity';
import { LikeStatusPostsEntity } from '../../../features/posts/entities/like-status-posts.entity';
import { LikeStatusCommentsEntity } from '../../../features/comments/entities/like-status-comments.entity';
import { InvalidJwtEntity } from '../../../features/auth/entities/invalid-jwt.entity';
import { SentCodesLogEntity } from '../../../mails/infrastructure/entities/sent-codes-log.entity';
import { BannedUsersForBlogsEntity } from '../../../features/users/entities/banned-users-for-blogs.entity';
import { QuestionsQuizEntity } from '../../../features/sa-quiz-questions/entities/questions-quiz.entity';
import { ChallengeQuestionsEntity } from '../../../features/pair-game-quiz/entities/challenge-questions.entity';
import { ChallengeAnswersEntity } from '../../../features/pair-game-quiz/entities/challenge-answers.entity';
import { PairsGameQuizEntity } from '../../../features/pair-game-quiz/entities/pairs-game-quiz.entity';
import { GamesResultsEntity } from '../../../features/pair-game-quiz/entities/games-results.entity';

@Injectable()
export class AppTypeOrmModuleOptions
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
        SecurityDevicesEntity,
        BloggerBlogsEntity,
        PostsEntity,
        CommentsEntity,
        BannedUsersForBlogsEntity,
        LikeStatusPostsEntity,
        LikeStatusCommentsEntity,
        InvalidJwtEntity,
        SentCodesLogEntity,
        QuestionsQuizEntity,
        PairsGameQuizEntity,
        ChallengeQuestionsEntity,
        ChallengeAnswersEntity,
        GamesResultsEntity,
      ],
      synchronize: true,
      logging: false,
    };
  }
}

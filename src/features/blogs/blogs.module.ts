import { Module } from '@nestjs/common';
import { BlogsService } from './application/blogs.service';
import { BlogsController } from './api/blogs.controller';
import { CaslModule } from '../../ability/casl.module';
import { BloggerBlogsService } from '../blogger-blogs/application/blogger-blogs.service';
import { PostsService } from '../posts/application/posts.service';
import { AuthService } from '../auth/application/auth.service';
import { UsersService } from '../users/application/users.service';
import { CqrsModule } from '@nestjs/cqrs';
import { UsersRawSqlRepository } from '../users/infrastructure/users-raw-sql.repository';
import { ParseQueriesService } from '../../common/query/parse-queries.service';
import { KeyResolver } from '../../common/helpers/key-resolver';
import { SearchBlogsUseCase } from './application/use-cases/search-blogs.use-case';
import { GetBlogByIdUseCase } from './application/use-cases/get-blog-by-id.use-case';
import { UsersRepo } from '../users/infrastructure/users-repo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from '../users/entities/users.entity';
import { InvalidJwtRepo } from '../auth/infrastructure/invalid-jwt-repo';
import { InvalidJwtEntity } from '../auth/entities/invalid-jwt.entity';
import { BloggerBlogsRepo } from '../blogger-blogs/infrastructure/blogger-blogs.repo';
import { BloggerBlogsEntity } from '../blogger-blogs/entities/blogger-blogs.entity';
import { UuidErrorResolver } from '../../common/helpers/uuid-error-resolver';
import { GamePairsRepo } from '../pair-game-quiz/infrastructure/game-pairs.repo';
import { GameQuestionsRepo } from '../pair-game-quiz/infrastructure/game-questions.repo';
import { ChallengesQuestionsRepo } from '../pair-game-quiz/infrastructure/challenges-questions.repo';
import { PairsGameEntity } from '../pair-game-quiz/entities/pairs-game.entity';
import { QuestionsQuizEntity } from '../sa-quiz-questions/entities/questions-quiz.entity';
import { ChallengeQuestionsEntity } from '../pair-game-quiz/entities/challenge-questions.entity';
import { BannedUsersForBlogsEntity } from '../users/entities/banned-users-for-blogs.entity';
import { BannedUsersForBlogsRepo } from '../users/infrastructure/banned-users-for-blogs.repo';

const blogsUseCases = [SearchBlogsUseCase, GetBlogByIdUseCase];

const helpers = [KeyResolver, UuidErrorResolver];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsersEntity,
      InvalidJwtEntity,
      BloggerBlogsEntity,
      PairsGameEntity,
      QuestionsQuizEntity,
      ChallengeQuestionsEntity,
      BannedUsersForBlogsEntity,
    ]),
    CaslModule,
    CqrsModule,
  ],
  controllers: [BlogsController],
  providers: [
    AuthService,
    ParseQueriesService,
    UsersService,
    BlogsService,
    PostsService,
    BloggerBlogsService,
    UsersRepo,
    UsersRawSqlRepository,
    BloggerBlogsRepo,
    InvalidJwtRepo,
    GamePairsRepo,
    GameQuestionsRepo,
    ChallengesQuestionsRepo,
    BannedUsersForBlogsRepo,
    ...helpers,
    ...blogsUseCases,
  ],
})
export class BlogsModule {}

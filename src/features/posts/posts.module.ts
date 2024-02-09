import { Module } from '@nestjs/common';
import { PostsService } from './application/posts.service';
import { PostsController } from './api/posts.controller';
import { CommentsService } from '../comments/application/comments.service';
import { CaslModule } from '../../ability/casl.module';
import { AuthService } from '../auth/application/auth.service';
import { UsersService } from '../users/application/users.service';
import { JwtService } from '@nestjs/jwt';
import { BloggerBlogsService } from '../blogger-blogs/application/blogger-blogs.service';
import { JwtConfig } from '../../config/jwt/jwt-config';
import { CqrsModule } from '@nestjs/cqrs';
import { CreatePostUseCase } from './application/use-cases/create-post.use-case';
import { ChangeLikeStatusPostUseCase } from './application/use-cases/change-likeStatus-post.use-case';
import { ParseQueriesService } from '../../common/query/parse-queries.service';
import { KeyResolver } from '../../common/helpers/key-resolver';
import { DeletePostByIdUseCase } from './application/use-cases/delete-post-by-id.use-case';
import { DeletePostByPostIdAndBlogIdUseCase } from './application/use-cases/delete-post-by-post-id-and-blog-id.use-case';
import { PostsRepo } from './infrastructure/posts-repo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsEntity } from './entities/posts.entity';
import { BloggerBlogsRepo } from '../blogger-blogs/infrastructure/blogger-blogs.repo';
import { BloggerBlogsEntity } from '../blogger-blogs/entities/blogger-blogs.entity';
import { UsersRepo } from '../users/infrastructure/users-repo';
import { UsersEntity } from '../users/entities/users.entity';
import { InvalidJwtRepo } from '../auth/infrastructure/invalid-jwt-repo';
import { InvalidJwtEntity } from '../auth/entities/invalid-jwt.entity';
import { LikeStatusPostsEntity } from './entities/like-status-posts.entity';
import { LikeStatusPostsRepo } from './infrastructure/like-status-posts.repo';
import { CommentsEntity } from '../comments/entities/comments.entity';
import { SaCreateSuperAdmin } from '../sa/application/use-cases/sa-create-super-admin.use-case';
import { EncryptConfig } from '../../config/encrypt/encrypt-config';
import { GetPostByIdUseCase } from './application/use-cases/get-post-by-id.use-case';
import { GetPostsUseCase } from './application/use-cases/get-posts.use-case';
import { GetPostsInBlogUseCase } from './application/use-cases/get-posts-in-blog.use-case';
import { UuidErrorResolver } from '../../common/helpers/uuid-error-resolver';
import { PairsGameEntity } from '../pair-game-quiz/entities/pairs-game.entity';
import { QuestionsQuizEntity } from '../sa-quiz-questions/entities/questions-quiz.entity';
import { ChallengeQuestionsEntity } from '../pair-game-quiz/entities/challenge-questions.entity';
import { GamePairsRepo } from '../pair-game-quiz/infrastructure/game-pairs.repo';
import { GameQuestionsRepo } from '../pair-game-quiz/infrastructure/game-questions.repo';
import { ChallengesQuestionsRepo } from '../pair-game-quiz/infrastructure/challenges-questions.repo';
import { UpdatePostByPostIdUseCase } from './application/use-cases/update-post-by-post-id.use-case';
import { BannedUsersForBlogsRepo } from '../users/infrastructure/banned-users-for-blogs.repo';
import { BannedUsersForBlogsEntity } from '../users/entities/banned-users-for-blogs.entity';
import { CalculatorExpirationDate } from '../../common/helpers/calculator-expiration-date/calculator-expiration-date';
import { PostsImagesFileMetadataRepo } from './infrastructure/posts-images-file-metadata.repo';
import { PostsImagesFileMetadataEntity } from './entities/posts-images-file-metadata.entity';

const postsUseCases = [
  GetPostsUseCase,
  GetPostByIdUseCase,
  GetPostsInBlogUseCase,
  CreatePostUseCase,
  UpdatePostByPostIdUseCase,
  ChangeLikeStatusPostUseCase,
  DeletePostByPostIdAndBlogIdUseCase,
  DeletePostByIdUseCase,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsersEntity,
      BloggerBlogsEntity,
      PostsEntity,
      CommentsEntity,
      InvalidJwtEntity,
      LikeStatusPostsEntity,
      PairsGameEntity,
      QuestionsQuizEntity,
      ChallengeQuestionsEntity,
      BannedUsersForBlogsEntity,
      PostsImagesFileMetadataEntity,
    ]),
    CaslModule,
    CqrsModule,
  ],
  controllers: [PostsController],
  providers: [
    SaCreateSuperAdmin,
    EncryptConfig,
    JwtConfig,
    AuthService,
    JwtService,
    PostsService,
    UsersService,
    CommentsService,
    ParseQueriesService,
    BloggerBlogsService,
    UsersRepo,
    PostsRepo,
    GamePairsRepo,
    InvalidJwtRepo,
    BloggerBlogsRepo,
    GameQuestionsRepo,
    LikeStatusPostsRepo,
    BannedUsersForBlogsRepo,
    ChallengesQuestionsRepo,
    PostsImagesFileMetadataRepo,
    KeyResolver,
    UuidErrorResolver,
    CalculatorExpirationDate,
    ...postsUseCases,
  ],
})
export class PostsModule {}

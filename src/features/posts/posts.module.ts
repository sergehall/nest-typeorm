import { Module } from '@nestjs/common';
import { PostsService } from './application/posts.service';
import { PostsController } from './api/posts.controller';
import { CommentsService } from '../comments/application/comments.service';
import { CaslModule } from '../../ability/casl.module';
import { AuthService } from '../auth/application/auth.service';
import { UsersService } from '../users/application/users.service';
import { JwtService } from '@nestjs/jwt';
import { BloggerBlogsService } from '../blogger-blogs/application/blogger-blogs.service';
import { JwtConfig } from '../../config/jwt/jwt.config';
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
import { EncryptConfig } from '../../config/encrypt/encrypt.config';
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
import { ImagesPostsOriginalMetadataRepo } from './infrastructure/images-posts-original-metadata.repo';
import { ImagesBlogsWallpaperMetadataEntity } from '../blogger-blogs/entities/images-blog-wallpaper-metadata.entity';
import { ImagesBlogsMainMetadataEntity } from '../blogger-blogs/entities/images-blog-main-metadata.entity';
import { InitializeS3Client } from '../../config/aws/s3/initialize-s3-client';
import { AwsConfig } from '../../config/aws/aws.config';
import { ImagesPostsOriginalMetadataEntity } from './entities/images-post-original-metadata.entity';
import { ImagesPostsMiddleMetadataEntity } from './entities/images-posts-middle-metadata.entity';
import { ImagesPostsSmallMetadataEntity } from './entities/images-posts-small-metadata.entity';
import { ImagesPostsSmallMetadataRepo } from './infrastructure/images-posts-small-metadata.repo';
import { ImagesPostsMiddleMetadataRepo } from './infrastructure/images-posts-middle-metadata.repo';
import { ImagesBlogsWallpaperMetadataRepo } from '../blogger-blogs/infrastructure/images-blogs-wallpaper-metadata.repo';
import { ImagesBlogsMainMetadataRepo } from '../blogger-blogs/infrastructure/images-blogs-main-metadata.repo';
import { SaConfig } from '../../config/sa/sa.config';
import { FilesMetadataService } from '../../adapters/media-services/files/files-metadata.service';

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

const helpers = [KeyResolver, UuidErrorResolver, CalculatorExpirationDate];

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
      ImagesBlogsMainMetadataEntity,
      ImagesBlogsWallpaperMetadataEntity,
      ImagesPostsOriginalMetadataEntity,
      ImagesPostsMiddleMetadataEntity,
      ImagesPostsSmallMetadataEntity,
    ]),
    CaslModule,
    CqrsModule,
  ],
  controllers: [PostsController],
  providers: [
    SaConfig,
    JwtConfig,
    AwsConfig,
    EncryptConfig,
    AuthService,
    JwtService,
    InitializeS3Client,
    PostsService,
    UsersService,
    CommentsService,
    ParseQueriesService,
    BloggerBlogsService,
    FilesMetadataService,
    UsersRepo,
    PostsRepo,
    GamePairsRepo,
    InvalidJwtRepo,
    BloggerBlogsRepo,
    GameQuestionsRepo,
    LikeStatusPostsRepo,
    BannedUsersForBlogsRepo,
    ChallengesQuestionsRepo,
    ImagesPostsOriginalMetadataRepo,
    ImagesBlogsMainMetadataRepo,
    ImagesPostsSmallMetadataRepo,
    ImagesPostsMiddleMetadataRepo,
    ImagesBlogsWallpaperMetadataRepo,
    ...postsUseCases,
    ...helpers,
  ],
})
export class PostsModule {}

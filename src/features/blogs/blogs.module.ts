import { Module } from '@nestjs/common';
import { BlogsService } from './application/blogs.service';
import { BlogsController } from './api/blogs.controller';
import { CaslModule } from '../../ability/casl.module';
import { BloggerBlogsService } from '../blogger-blogs/application/blogger-blogs.service';
import { PostsService } from '../posts/application/posts.service';
import { AuthService } from '../auth/application/auth.service';
import { UsersService } from '../users/application/users.service';
import { CqrsModule } from '@nestjs/cqrs';
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
import { ImagesPostsMetadataRepo } from '../posts/infrastructure/images-posts-metadata.repo';
import { ImagesBlogsWallpaperMetadataEntity } from '../blogger-blogs/entities/images-blog-wallpaper-metadata.entity';
import { ImagesBlogsMainMetadataEntity } from '../blogger-blogs/entities/images-blog-main-metadata.entity';
import { FileMetadataService } from '../../common/helpers/file-metadata-from-buffer.service/file-metadata-service';
import { S3Service } from '../../config/aws/s3/s3-service';
import { AwsConfig } from '../../config/aws/aws-config';
import { ImagesPostsOriginalMetadataEntity } from '../posts/entities/images-post-original-metadata.entity';
import { ImagesPostsMiddleMetadataEntity } from '../posts/entities/images-posts-middle-metadata.entity';
import { ImagesPostsSmallMetadataEntity } from '../posts/entities/images-posts-small-metadata.entity';

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
      ImagesBlogsMainMetadataEntity,
      ImagesBlogsWallpaperMetadataEntity,
      ImagesPostsOriginalMetadataEntity,
      ImagesPostsMiddleMetadataEntity,
      ImagesPostsSmallMetadataEntity,
    ]),
    CaslModule,
    CqrsModule,
  ],
  controllers: [BlogsController],
  providers: [
    AwsConfig,
    AuthService,
    S3Service,
    UsersService,
    BlogsService,
    PostsService,
    FileMetadataService,
    ParseQueriesService,
    BloggerBlogsService,
    UsersRepo,
    GamePairsRepo,
    InvalidJwtRepo,
    BloggerBlogsRepo,
    GameQuestionsRepo,
    ChallengesQuestionsRepo,
    BannedUsersForBlogsRepo,
    ImagesPostsMetadataRepo,
    ...helpers,
    ...blogsUseCases,
  ],
})
export class BlogsModule {}

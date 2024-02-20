import { Module } from '@nestjs/common';
import { BloggerBlogsController } from './api/blogger-blogs.controller';
import { BloggerBlogsService } from './application/blogger-blogs.service';
import { PostsService } from '../posts/application/posts.service';
import { CaslAbilityFactory } from '../../ability/casl-ability.factory';
import { CreateBloggerBlogUseCase } from './application/use-cases/create-blogger-blog.use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { UpdateBlogByIdUseCase } from './application/use-cases/update-blog-by-id.use-case';
import { ParseQueriesService } from '../../common/query/parse-queries.service';
import { KeyResolver } from '../../common/helpers/key-resolver';
import { SearchBannedUsersInBlogUseCase } from './application/use-cases/search-banned-users-in-blog.use.case';
import { ManageBlogAccessUseCase } from './application/use-cases/manage-blog-access.use-case';
import { GetBlogsOwnedByCurrentUserUseCase } from './application/use-cases/get-blogs-owned-by-current-user.use-case';
import { DeleteBlogByBlogIdUseCase } from './application/use-cases/delete-blog-by-blog-id.use-case';
import { BloggerBlogsRepo } from './infrastructure/blogger-blogs.repo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BloggerBlogsEntity } from './entities/blogger-blogs.entity';
import { PostsRepo } from '../posts/infrastructure/posts-repo';
import { PostsEntity } from '../posts/entities/posts.entity';
import { LikeStatusPostsEntity } from '../posts/entities/like-status-posts.entity';
import { CommentsEntity } from '../comments/entities/comments.entity';
import { BlogExistsValidator } from '../../common/validators/blog-exists.validator';
import { UuidErrorResolver } from '../../common/helpers/uuid-error-resolver';
import { PairsGameEntity } from '../pair-game-quiz/entities/pairs-game.entity';
import { QuestionsQuizEntity } from '../sa-quiz-questions/entities/questions-quiz.entity';
import { ChallengeQuestionsEntity } from '../pair-game-quiz/entities/challenge-questions.entity';
import { GamePairsRepo } from '../pair-game-quiz/infrastructure/game-pairs.repo';
import { GameQuestionsRepo } from '../pair-game-quiz/infrastructure/game-questions.repo';
import { ChallengesQuestionsRepo } from '../pair-game-quiz/infrastructure/challenges-questions.repo';
import { BannedUsersForBlogsRepo } from '../users/infrastructure/banned-users-for-blogs.repo';
import { BannedUsersForBlogsEntity } from '../users/entities/banned-users-for-blogs.entity';
import { UsersRepo } from '../users/infrastructure/users-repo';
import { UsersEntity } from '../users/entities/users.entity';
import { LikeStatusPostsRepo } from '../posts/infrastructure/like-status-posts.repo';
import { AwsConfig } from '../../config/aws/aws-config';
import { UploadImagesPostsUseCase } from './application/use-cases/upload-images-posts-use-case';
import { S3Service } from '../../config/aws/s3/s3-service';
import { FileStorageAdapter } from '../../common/file-storage-adapter/file-storage-adapter';
import { FileMetadataService } from '../../common/helpers/file-metadata-from-buffer.service/file-metadata-service';
import { ImagesPostsMetadataRepo } from '../posts/infrastructure/images-posts-metadata.repo';
import { UploadImagesBlogsWallpaperUseCase } from './application/use-cases/upload-images-blogs-wallpaper-use-case';
import { ImagesBlogsWallpaperMetadataEntity } from './entities/images-blog-wallpaper-metadata.entity';
import { ImagesBlogsMainMetadataEntity } from './entities/images-blog-main-metadata.entity';
import { UploadImagesBlogsMainUseCase } from './application/use-cases/upload-images-blogs-main-use-case';
import { ImagesPostsOriginalMetadataEntity } from '../posts/entities/images-post-original-metadata.entity';
import { ImagesPostSmallMetadataEntity } from '../posts/entities/images-post-small-metadata.entity';
import { ImagesPostMiddleMetadataEntity } from '../posts/entities/images-post-middle-metadata.entity';

const bloggersBlogUseCases = [
  GetBlogsOwnedByCurrentUserUseCase,
  SearchBannedUsersInBlogUseCase,
  ManageBlogAccessUseCase,
  CreateBloggerBlogUseCase,
  UpdateBlogByIdUseCase,
  DeleteBlogByBlogIdUseCase,
  UploadImagesPostsUseCase,
  UploadImagesBlogsWallpaperUseCase,
  UploadImagesBlogsMainUseCase,
];

const validators = [BlogExistsValidator];
const helpers = [KeyResolver, UuidErrorResolver];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsersEntity,
      PostsEntity,
      CommentsEntity,
      BloggerBlogsEntity,
      LikeStatusPostsEntity,
      PairsGameEntity,
      QuestionsQuizEntity,
      ChallengeQuestionsEntity,
      BannedUsersForBlogsEntity,
      ImagesBlogsMainMetadataEntity,
      ImagesBlogsWallpaperMetadataEntity,
      ImagesPostsOriginalMetadataEntity,
      ImagesPostMiddleMetadataEntity,
      ImagesPostSmallMetadataEntity,
    ]),
    CqrsModule,
  ],
  controllers: [BloggerBlogsController],
  providers: [
    AwsConfig,
    CaslAbilityFactory,
    S3Service,
    FileStorageAdapter,
    FileMetadataService,
    ParseQueriesService,
    BloggerBlogsService,
    PostsService,
    UsersRepo,
    PostsRepo,
    GamePairsRepo,
    BloggerBlogsRepo,
    GameQuestionsRepo,
    LikeStatusPostsRepo,
    ChallengesQuestionsRepo,
    BannedUsersForBlogsRepo,
    ImagesPostsMetadataRepo,
    ...helpers,
    ...bloggersBlogUseCases,
    ...validators,
  ],
})
export class BloggerBlogsModule {}

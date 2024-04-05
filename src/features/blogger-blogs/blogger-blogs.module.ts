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
import { AwsConfig } from '../../config/aws/aws.config';
import { UploadFilesPostsUseCase } from './application/use-cases/upload-files-posts-use-case';
import { InitializeS3Client } from '../../config/aws/s3/initialize-s3-client';
import { ImagesPostsOriginalMetadataRepo } from '../posts/infrastructure/images-posts-original-metadata.repo';
import { UploadFilesBlogsWallpaperUseCase } from './application/use-cases/upload-files-blogs-wallpaper-use-case';
import { ImagesBlogsWallpaperMetadataEntity } from './entities/images-blog-wallpaper-metadata.entity';
import { ImagesBlogsMainMetadataEntity } from './entities/images-blog-main-metadata.entity';
import { UploadFilesBlogsMainUseCase } from './application/use-cases/upload-files-blogs-main-use-case';
import { ImagesPostsOriginalMetadataEntity } from '../posts/entities/images-post-original-metadata.entity';
import { ImagesPostsSmallMetadataEntity } from '../posts/entities/images-posts-small-metadata.entity';
import { ImagesPostsMiddleMetadataEntity } from '../posts/entities/images-posts-middle-metadata.entity';
import { ImagesPostsSmallMetadataRepo } from '../posts/infrastructure/images-posts-small-metadata.repo';
import { ImagesPostsMiddleMetadataRepo } from '../posts/infrastructure/images-posts-middle-metadata.repo';
import { ImagesBlogsWallpaperMetadataRepo } from './infrastructure/images-blogs-wallpaper-metadata.repo';
import { ImagesBlogsMainMetadataRepo } from './infrastructure/images-blogs-main-metadata.repo';
import { ManageBlogsSubscribeUseCase } from './application/use-cases/manage-blogs-subscribe.use-case';
import { BlogsSubscribersEntity } from './entities/blogs-subscribers.entity';
import { BlogsSubscribersRepo } from './infrastructure/blogs-subscribers.repo';
import { TelegramBotStatusEntity } from '../telegram/entities/telegram-bot-status.entity';
import { TelegramBotStatusRepo } from '../telegram/infrastructure/telegram-bot-status.repo';
import { FilesMetadataService } from '../../adapters/media-services/files/files-metadata.service';
import { FilesStorageAdapter } from '../../adapters/media-services/files-storage-adapter';

const bloggersBlogUseCases = [
  GetBlogsOwnedByCurrentUserUseCase,
  SearchBannedUsersInBlogUseCase,
  ManageBlogAccessUseCase,
  CreateBloggerBlogUseCase,
  UpdateBlogByIdUseCase,
  DeleteBlogByBlogIdUseCase,
  UploadFilesPostsUseCase,
  UploadFilesBlogsWallpaperUseCase,
  UploadFilesBlogsMainUseCase,
  ManageBlogsSubscribeUseCase,
];

const services = [
  InitializeS3Client,
  PostsService,
  ParseQueriesService,
  BloggerBlogsService,
  FilesMetadataService,
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
      BlogsSubscribersEntity,
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
      TelegramBotStatusEntity,
    ]),
    CqrsModule,
  ],
  controllers: [BloggerBlogsController],
  providers: [
    AwsConfig,
    CaslAbilityFactory,
    FilesStorageAdapter,
    UsersRepo,
    PostsRepo,
    GamePairsRepo,
    BloggerBlogsRepo,
    GameQuestionsRepo,
    LikeStatusPostsRepo,
    BlogsSubscribersRepo,
    ChallengesQuestionsRepo,
    BannedUsersForBlogsRepo,
    TelegramBotStatusRepo,
    ImagesPostsOriginalMetadataRepo,
    ImagesPostsSmallMetadataRepo,
    ImagesBlogsMainMetadataRepo,
    ImagesPostsMiddleMetadataRepo,
    ImagesBlogsWallpaperMetadataRepo,
    ...helpers,
    ...services,
    ...validators,
    ...bloggersBlogUseCases,
  ],
})
export class BloggerBlogsModule {}

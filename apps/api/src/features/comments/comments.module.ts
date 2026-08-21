import { Module } from '@nestjs/common';
import { CommentsService } from './application/comments.service';
import { CommentsController } from './api/comments.controller';
import { CaslModule } from '../../ability/casl.module';
import { PostsService } from '../posts/application/posts.service';
import { AuthService } from '../auth/application/auth.service';
import { UsersService } from '../users/application/users.service';
import { JwtService } from '@nestjs/jwt';
import { JwtConfig } from '../../config/jwt/jwt.config';
import { CqrsModule } from '@nestjs/cqrs';
import { ChangeLikeStatusCommentUseCase } from './application/use-cases/change-likeStatus-comment.use-case';
import { CreateCommentUseCase } from './application/use-cases/create-comment.use-case';
import { UpdateCommentUseCase } from './application/use-cases/update-comment.use-case';
import { KeyResolver } from '../../common/helpers/key-resolver';
import { UsersRepo } from '../users/infrastructure/users-repo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from '../users/entities/users.entity';
import { LikeStatusCommentsRepo } from './infrastructure/like-status-comments.repo';
import { LikeStatusCommentsEntity } from './entities/like-status-comments.entity';
import { CommentsRepo } from './infrastructure/comments.repo';
import { CommentsEntity } from './entities/comments.entity';
import { InvalidJwtRepo } from '../auth/infrastructure/invalid-jwt-repo';
import { InvalidJwtEntity } from '../auth/entities/invalid-jwt.entity';
import { PostsRepo } from '../posts/infrastructure/posts-repo';
import { PostsEntity } from '../posts/entities/posts.entity';
import { LikeStatusPostsEntity } from '../posts/entities/like-status-posts.entity';
import { DeleteCommentUseCase } from './application/use-cases/delete-comment.use-case';
import { GetCommentsByPostIdUseCase } from './application/use-cases/get-comments-by-post-id.use-case';
import { GetCommentByIdUseCase } from './application/use-cases/get-comment-by-id';
import { GetCommentsByUserIdUseCase } from '../blogger-blogs/application/use-cases/get-comments-by-user-id.use-case';
import { UuidErrorResolver } from '../../common/helpers/uuid-error-resolver';
import { GamePairsRepo } from '../pair-game-quiz/infrastructure/game-pairs.repo';
import { GameQuestionsRepo } from '../pair-game-quiz/infrastructure/game-questions.repo';
import { ChallengesQuestionsRepo } from '../pair-game-quiz/infrastructure/challenges-questions.repo';
import { PairsGameEntity } from '../pair-game-quiz/entities/pairs-game.entity';
import { QuestionsQuizEntity } from '../sa-quiz-questions/entities/questions-quiz.entity';
import { ChallengeQuestionsEntity } from '../pair-game-quiz/entities/challenge-questions.entity';
import { BannedUsersForBlogsRepo } from '../users/infrastructure/banned-users-for-blogs.repo';
import { BannedUsersForBlogsEntity } from '../users/entities/banned-users-for-blogs.entity';
import { LikeStatusPostsRepo } from '../posts/infrastructure/like-status-posts.repo';
import { InitializeS3Client } from '../../config/aws/s3/initialize-s3-client';
import { AwsConfig } from '../../config/aws/aws.config';
import { FilesMetadataService } from '../../adapters/media-services/files/files-metadata.service';

const commentsUseCases = [
  GetCommentsByUserIdUseCase,
  GetCommentsByPostIdUseCase,
  GetCommentByIdUseCase,
  CreateCommentUseCase,
  UpdateCommentUseCase,
  DeleteCommentUseCase,
  ChangeLikeStatusCommentUseCase,
];

const helpers = [KeyResolver, UuidErrorResolver];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsersEntity,
      PostsEntity,
      CommentsEntity,
      LikeStatusPostsEntity,
      LikeStatusCommentsEntity,
      InvalidJwtEntity,
      PairsGameEntity,
      QuestionsQuizEntity,
      ChallengeQuestionsEntity,
      BannedUsersForBlogsEntity,
    ]),
    CaslModule,
    CqrsModule,
  ],
  controllers: [CommentsController],
  providers: [
    AwsConfig,
    InitializeS3Client,
    CommentsService,
    JwtConfig,
    JwtService,
    PostsService,
    AuthService,
    UsersService,
    FilesMetadataService,
    CommentsRepo,
    UsersRepo,
    PostsRepo,
    InvalidJwtRepo,
    GamePairsRepo,
    GameQuestionsRepo,
    LikeStatusPostsRepo,
    LikeStatusCommentsRepo,
    BannedUsersForBlogsRepo,
    ChallengesQuestionsRepo,
    ...helpers,
    ...commentsUseCases,
  ],
})
export class CommentsModule {}

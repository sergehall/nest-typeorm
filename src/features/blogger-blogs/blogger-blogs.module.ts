import { Module } from '@nestjs/common';
import { BloggerBlogsController } from './api/blogger-blogs.controller';
import { BloggerBlogsService } from './application/blogger-blogs.service';
import { PostsService } from '../posts/application/posts.service';
import { CaslAbilityFactory } from '../../ability/casl-ability.factory';
import { CreateBloggerBlogUseCase } from './application/use-cases/create-blogger-blog.use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { UpdateBlogByIdUseCase } from './application/use-cases/update-blog-byId.use-case';
import { BloggerBlogsRawSqlRepository } from './infrastructure/blogger-blogs-raw-sql.repository';
import { UsersRawSqlRepository } from '../users/infrastructure/users-raw-sql.repository';
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

const bloggersBlogUseCases = [
  GetBlogsOwnedByCurrentUserUseCase,
  SearchBannedUsersInBlogUseCase,
  ManageBlogAccessUseCase,
  CreateBloggerBlogUseCase,
  UpdateBlogByIdUseCase,
  DeleteBlogByBlogIdUseCase,
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
    ]),
    CqrsModule,
  ],
  controllers: [BloggerBlogsController],
  providers: [
    CaslAbilityFactory,
    ParseQueriesService,
    BloggerBlogsService,
    PostsService,
    UsersRawSqlRepository,
    BloggerBlogsRepo,
    BloggerBlogsRawSqlRepository,
    UsersRepo,
    PostsRepo,
    GamePairsRepo,
    GameQuestionsRepo,
    ChallengesQuestionsRepo,
    BannedUsersForBlogsRepo,
    ...helpers,
    ...bloggersBlogUseCases,
    ...validators,
  ],
})
export class BloggerBlogsModule {}

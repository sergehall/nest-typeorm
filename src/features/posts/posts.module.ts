import { Module } from '@nestjs/common';
import { PostsService } from './application/posts.service';
import { PostsController } from './api/posts.controller';
import { CommentsService } from '../comments/application/comments.service';
import { CaslModule } from '../../ability/casl.module';
import { AuthService } from '../auth/application/auth.service';
import { UsersService } from '../users/application/users.service';
import { JwtService } from '@nestjs/jwt';
import { MailsRawSqlRepository } from '../mails/infrastructure/mails-raw-sql.repository';
import { BloggerBlogsService } from '../blogger-blogs/application/blogger-blogs.service';
import { JwtConfig } from '../../config/jwt/jwt-config';
import { CqrsModule } from '@nestjs/cqrs';
import { RemovePostByPostIdUseCase } from './application/use-cases/remove-post-byPostId.use-case';
import { CreatePostUseCase } from './application/use-cases/create-post.use-case';
import { RemovePostByIdOldUseCase } from './application/use-cases/remove-post-byId-old.use-case';
import { ChangeLikeStatusPostUseCase } from './application/use-cases/change-likeStatus-post.use-case';
import { UsersRawSqlRepository } from '../users/infrastructure/users-raw-sql.repository';
import { BloggerBlogsRawSqlRepository } from '../blogger-blogs/infrastructure/blogger-blogs-raw-sql.repository';
import { PostsRawSqlRepository } from './infrastructure/posts-raw-sql.repository';
import { LikeStatusPostsRawSqlRepository } from './infrastructure/like-status-posts-raw-sql.repository';
import { CommentsRawSqlRepository } from '../comments/infrastructure/comments-raw-sql.repository';
import { BlacklistJwtRawSqlRepository } from '../auth/infrastructure/blacklist-jwt-raw-sql.repository';
import { UpdatePostByPostIdUseCase } from './application/use-cases/update-post.use-case';
import { BannedUsersForBlogsRawSqlRepository } from '../users/infrastructure/banned-users-for-blogs-raw-sql.repository';
import { LikeStatusCommentsRawSqlRepository } from '../comments/infrastructure/like-status-comments-raw-sql.repository';
import { ChangeBanStatusPostsByBlogIdUseCase } from './application/use-cases/change-banstatus-posts-by-blogid.use-case';
import { ChangeBanStatusPostsUseCase } from './application/use-cases/change-banstatus-posts.use-case';
import { ChangeBanStatusLikesPostForBannedUserUseCase } from './application/use-cases/change-banstatus-posts-by-userid-blogid.use-case';
import { ParseQueriesService } from '../common/query/parse-queries.service';
import { KeyArrayProcessor } from '../common/query/get-key-from-array-or-default';
import { FindPostsByPostIdUseCase } from './application/use-cases/find-posts-by-post-id.use-case';

const postsUseCases = [
  FindPostsByPostIdUseCase,
  CreatePostUseCase,
  UpdatePostByPostIdUseCase,
  RemovePostByPostIdUseCase,
  RemovePostByIdOldUseCase,
  ChangeBanStatusPostsUseCase,
  ChangeLikeStatusPostUseCase,
  ChangeBanStatusPostsByBlogIdUseCase,
  ChangeBanStatusLikesPostForBannedUserUseCase,
];

@Module({
  imports: [CaslModule, CqrsModule],
  controllers: [PostsController],
  providers: [
    AuthService,
    JwtConfig,
    JwtService,
    PostsService,
    KeyArrayProcessor,
    ParseQueriesService,
    CommentsService,
    MailsRawSqlRepository,
    UsersService,
    BloggerBlogsService,
    UsersRawSqlRepository,
    BloggerBlogsRawSqlRepository,
    LikeStatusPostsRawSqlRepository,
    CommentsRawSqlRepository,
    PostsRawSqlRepository,
    BlacklistJwtRawSqlRepository,
    BannedUsersForBlogsRawSqlRepository,
    LikeStatusCommentsRawSqlRepository,
    ...postsUseCases,
  ],
})
export class PostsModule {}

import { Module } from '@nestjs/common';
import { PostsService } from './application/posts.service';
import { PostsController } from './api/posts.controller';
import { CommentsService } from '../comments/application/comments.service';
import { Pagination } from '../common/pagination/pagination';
import { CaslModule } from '../../ability/casl.module';
import { postsProviders } from './infrastructure/posts.providers';
import { ConvertFiltersForDB } from '../common/convert-filters/convertFiltersForDB';
import { PostsRepository } from './infrastructure/posts.repository';
import { CommentsRepository } from '../comments/infrastructure/comments.repository';
import { LikeStatusPostsRepository } from './infrastructure/like-status-posts.repository';
import { LikeStatusCommentsRepository } from '../comments/infrastructure/like-status-comments.repository';
import { UsersRepository } from '../users/infrastructure/users.repository';
import { AuthService } from '../auth/application/auth.service';
import { UsersService } from '../users/application/users.service';
import { JwtService } from '@nestjs/jwt';
import { MailsRawSqlRepository } from '../mails/infrastructure/mails-raw-sql.repository';
import { BlacklistJwtRepository } from '../auth/infrastructure/blacklist-jwt.repository';
import { BloggerBlogsService } from '../blogger-blogs/application/blogger-blogs.service';
import { BloggerBlogsRepository } from '../blogger-blogs/infrastructure/blogger-blogs.repository';
import { JwtConfig } from '../../config/jwt/jwt-config';
import { CqrsModule } from '@nestjs/cqrs';
import { ChangeBanStatusPostsUseCase } from './application/use-cases/change-banStatus-posts.use-case';
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
import { ChangeBanStatusPostsByBlogIdUseCase } from './application/use-cases/change-banStatus-posts-byBlogId.use-case';
import { BannedUsersForBlogsRawSqlRepository } from '../users/infrastructure/banned-users-for-blogs-raw-sql.repository';
import { ChangeBanStatusLikesPostForBannedUserUseCase } from './application/use-cases/change-banStatus-posts -by-userId-blogId.use-case';
import { LikeStatusCommentsRawSqlRepository } from '../comments/infrastructure/like-status-comments-raw-sql.repository';
import { MongoDBModule } from '../../config/db/mongo/mongo-db.module';

const postsUseCases = [
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
  imports: [MongoDBModule, CaslModule, CqrsModule],
  controllers: [PostsController],
  providers: [
    AuthService,
    BlacklistJwtRepository,
    JwtConfig,
    JwtService,
    PostsService,
    CommentsService,
    MailsRawSqlRepository,
    CommentsRepository,
    ConvertFiltersForDB,
    UsersService,
    UsersRepository,
    BloggerBlogsService,
    Pagination,
    PostsRepository,
    UsersRawSqlRepository,
    BloggerBlogsRepository,
    LikeStatusPostsRepository,
    LikeStatusCommentsRepository,
    BloggerBlogsRawSqlRepository,
    LikeStatusPostsRawSqlRepository,
    CommentsRawSqlRepository,
    PostsRawSqlRepository,
    BlacklistJwtRawSqlRepository,
    BannedUsersForBlogsRawSqlRepository,
    LikeStatusCommentsRawSqlRepository,
    ...postsUseCases,
    ...postsProviders,
  ],
})
export class PostsModule {}

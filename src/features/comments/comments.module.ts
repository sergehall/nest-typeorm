import { Module } from '@nestjs/common';
import { CommentsService } from './application/comments.service';
import { CommentsController } from './api/comments.controller';
import { Pagination } from '../common/pagination/pagination';
import { commentsProviders } from './infrastructure/comments.providers';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { CaslModule } from '../../ability/casl.module';
import { CommentsRepository } from './infrastructure/comments.repository';
import { LikeStatusCommentsRepository } from './infrastructure/like-status-comments.repository';
import { PostsRepository } from '../posts/infrastructure/posts.repository';
import { PostsService } from '../posts/application/posts.service';
import { LikeStatusPostsRepository } from '../posts/infrastructure/like-status-posts.repository';
import { AuthService } from '../auth/application/auth.service';
import { UsersService } from '../users/application/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConvertFiltersForDB } from '../common/convert-filters/convertFiltersForDB';
import { UsersRepository } from '../users/infrastructure/users.repository';
import { MailsRepository } from '../mails/infrastructure/mails.repository';
import { BlacklistJwtRepository } from '../auth/infrastructure/blacklist-jwt.repository';
import { JwtConfig } from '../../config/jwt/jwt-config';
import { ChangeBanStatusCommentsUseCase } from './application/use-cases/change-banStatus-comments.use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { ChangeLikeStatusCommentUseCase } from './application/use-cases/change-likeStatus-comment.use-case';
import { CreateCommentUseCase } from './application/use-cases/create-comment.use-case';
import { UpdateCommentUseCase } from './application/use-cases/update-comment.use-case';
import { RemoveCommentUseCase } from './application/use-cases/remove-comment.use-case';
import { FillingCommentsDataUseCase } from './application/use-cases/filling-comments-data.use-case';
import { ChangeBanStatusCommentsByUserIdBlogIdUseCase } from './application/use-cases/change-banStatus-comments-by-userId-blogId.use-case';
import { BloggerBlogsRepository } from '../blogger-blogs/infrastructure/blogger-blogs.repository';
import { UsersRawSqlRepository } from '../users/infrastructure/users-raw-sql.repository';
import { PostsRawSqlRepository } from '../posts/infrastructure/posts-raw-sql.repository';
import { BloggerBlogsRawSqlRepository } from '../blogger-blogs/infrastructure/blogger-blogs-raw-sql.repository';
import { CommentsRawSqlRepository } from './infrastructure/comments-raw-sql.repository';
import { LikeStatusCommentsRawSqlRepository } from './infrastructure/like-status-comments-raw-sql.repository';
import { LikeStatusPostsRawSqlRepository } from '../posts/infrastructure/like-status-posts-raw-sql.repository';

const commentsUseCases = [
  CreateCommentUseCase,
  UpdateCommentUseCase,
  RemoveCommentUseCase,
  ChangeBanStatusCommentsUseCase,
  ChangeLikeStatusCommentUseCase,
  FillingCommentsDataUseCase,
  ChangeBanStatusCommentsByUserIdBlogIdUseCase,
];

@Module({
  imports: [DatabaseModule, CaslModule, CqrsModule],
  controllers: [CommentsController],
  providers: [
    CommentsService,
    BlacklistJwtRepository,
    JwtConfig,
    JwtService,
    CommentsRepository,
    PostsService,
    PostsRepository,
    ConvertFiltersForDB,
    LikeStatusPostsRepository,
    LikeStatusCommentsRepository,
    Pagination,
    AuthService,
    UsersService,
    UsersRepository,
    MailsRepository,
    UsersRawSqlRepository,
    BloggerBlogsRepository,
    PostsRawSqlRepository,
    BloggerBlogsRawSqlRepository,
    CommentsRawSqlRepository,
    LikeStatusCommentsRawSqlRepository,
    LikeStatusPostsRawSqlRepository,
    ...commentsUseCases,
    ...commentsProviders,
  ],
})
export class CommentsModule {}

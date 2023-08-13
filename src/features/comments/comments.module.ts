import { Module } from '@nestjs/common';
import { CommentsService } from './application/comments.service';
import { CommentsController } from './api/comments.controller';
import { CaslModule } from '../../ability/casl.module';
import { PostsService } from '../posts/application/posts.service';
import { AuthService } from '../auth/application/auth.service';
import { UsersService } from '../users/application/users.service';
import { JwtService } from '@nestjs/jwt';
import { JwtConfig } from '../../config/jwt/jwt-config';
import { ChangeBanStatusCommentsUseCase } from './application/use-cases/change-banStatus-comments.use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { ChangeLikeStatusCommentUseCase } from './application/use-cases/change-likeStatus-comment.use-case';
import { CreateCommentUseCase } from './application/use-cases/create-comment.use-case';
import { RemoveCommentUseCase } from './application/use-cases/remove-comment.use-case';
import { FillingCommentsDataUseCase } from './application/use-cases/filling-comments-data.use-case';
import { ChangeBanStatusCommentsByUserIdBlogIdUseCase } from './application/use-cases/change-banStatus-comments-by-userId-blogId.use-case';
import { UsersRawSqlRepository } from '../users/infrastructure/users-raw-sql.repository';
import { PostsRawSqlRepository } from '../posts/infrastructure/posts-raw-sql.repository';
import { BloggerBlogsRawSqlRepository } from '../blogger-blogs/infrastructure/blogger-blogs-raw-sql.repository';
import { CommentsRawSqlRepository } from './infrastructure/comments-raw-sql.repository';
import { LikeStatusCommentsRawSqlRepository } from './infrastructure/like-status-comments-raw-sql.repository';
import { LikeStatusPostsRawSqlRepository } from '../posts/infrastructure/like-status-posts-raw-sql.repository';
import { BlacklistJwtRawSqlRepository } from '../auth/infrastructure/blacklist-jwt-raw-sql.repository';
import { ChangeBanStatusCommentsByBlogIdUseCase } from './application/use-cases/change-banStatus-comments-by-blogId.use-case';
import { BannedUsersForBlogsRawSqlRepository } from '../users/infrastructure/banned-users-for-blogs-raw-sql.repository';
import { FindCommentByIdUseCase } from './application/use-cases/find-comment-by-id';
import { UpdateCommentUseCase } from './application/use-cases/update-comment.use-case';
import { FindCommentsByPostIdUseCase } from './application/use-cases/find-comments-by-post-id.use-case';
import { KeyResolver } from '../../common/query/key-resolver';

const commentsUseCases = [
  FindCommentsByPostIdUseCase,
  FindCommentByIdUseCase,
  CreateCommentUseCase,
  UpdateCommentUseCase,
  RemoveCommentUseCase,
  ChangeBanStatusCommentsUseCase,
  ChangeLikeStatusCommentUseCase,
  FillingCommentsDataUseCase,
  ChangeBanStatusCommentsByUserIdBlogIdUseCase,
  ChangeBanStatusCommentsByBlogIdUseCase,
];

@Module({
  imports: [CaslModule, CqrsModule],
  controllers: [CommentsController],
  providers: [
    CommentsService,
    JwtConfig,
    JwtService,
    PostsService,
    AuthService,
    UsersService,
    KeyResolver,
    UsersRawSqlRepository,
    PostsRawSqlRepository,
    BloggerBlogsRawSqlRepository,
    CommentsRawSqlRepository,
    LikeStatusCommentsRawSqlRepository,
    LikeStatusPostsRawSqlRepository,
    BlacklistJwtRawSqlRepository,
    BannedUsersForBlogsRawSqlRepository,
    ...commentsUseCases,
  ],
})
export class CommentsModule {}

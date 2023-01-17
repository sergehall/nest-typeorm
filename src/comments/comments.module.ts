import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { Pagination } from '../infrastructure/common/pagination/pagination';
import { commentsProviders } from './infrastructure/comments.providers';
import { DatabaseModule } from '../infrastructure/database/database.module';
import { CaslModule } from '../ability/casl.module';
import { CommentsRepository } from './infrastructure/comments.repository';
import { LikeStatusCommentsRepository } from './infrastructure/like-status-comments.repository';
import { PostsRepository } from '../posts/infrastructure/posts.repository';
import { PostsService } from '../posts/posts.service';
import { LikeStatusPostsRepository } from '../posts/infrastructure/like-status-posts.repository';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConvertFiltersForDB } from '../infrastructure/common/convert-filters/convertFiltersForDB';
import { UsersRepository } from '../users/infrastructure/users.repository';
import { MailsRepository } from '../mails/infrastructure/mails.repository';
import { BlacklistJwtRepository } from '../auth/infrastructure/blacklist-jwt.repository';

@Module({
  imports: [DatabaseModule, CaslModule],
  controllers: [CommentsController],
  providers: [
    CommentsService,
    BlacklistJwtRepository,
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
    ...commentsProviders,
  ],
})
export class CommentsModule {}

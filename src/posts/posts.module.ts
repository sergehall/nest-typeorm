import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { CommentsService } from '../comments/comments.service';
import { Pagination } from '../infrastructure/common/pagination/pagination';
import { DatabaseModule } from '../infrastructure/database/database.module';
import { CaslModule } from '../ability/casl.module';
import { postsProviders } from './infrastructure/posts.providers';
import { ConvertFiltersForDB } from '../infrastructure/common/convert-filters/convertFiltersForDB';
import { PostsRepository } from './infrastructure/posts.repository';
import { CommentsRepository } from '../comments/infrastructure/comments.repository';
import { LikeStatusPostsRepository } from './infrastructure/like-status-posts.repository';
import { LikeStatusCommentsRepository } from '../comments/infrastructure/like-status-comments.repository';
import { UsersRepository } from '../users/infrastructure/users.repository';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { MailsRepository } from '../mails/infrastructure/mails.repository';
import { BlacklistJwtRepository } from '../auth/infrastructure/blacklist-jwt.repository';
import { BloggerBlogsService } from '../blogger-blogs/blogger-blogs.service';
import { BloggerBlogsRepository } from '../blogger-blogs/infrastructure/blogger-blogs.repository';
import { JwtConfig } from '../config/jwt/jwt-config';

@Module({
  imports: [DatabaseModule, CaslModule],
  controllers: [PostsController],
  providers: [
    AuthService,
    BlacklistJwtRepository,
    JwtConfig,
    JwtService,
    PostsService,
    CommentsService,
    MailsRepository,
    CommentsRepository,
    ConvertFiltersForDB,
    UsersService,
    UsersRepository,
    BloggerBlogsService,
    Pagination,
    PostsRepository,
    BloggerBlogsRepository,
    LikeStatusPostsRepository,
    LikeStatusCommentsRepository,
    ...postsProviders,
  ],
})
export class PostsModule {}

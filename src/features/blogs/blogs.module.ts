import { Module } from '@nestjs/common';
import { BlogsService } from './application/blogs.service';
import { BlogsController } from './api/blogs.controller';
import { BlogsRepository } from './infrastructure/blogs.repository';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { blogsProviders } from './infrastructure/blogs.providers';
import { CaslModule } from '../../ability/casl.module';
import { BloggerBlogsRepository } from '../blogger-blogs/infrastructure/blogger-blogs.repository';
import { BloggerBlogsService } from '../blogger-blogs/application/blogger-blogs.service';
import { ConvertFiltersForDB } from '../common/convert-filters/convertFiltersForDB';
import { Pagination } from '../common/pagination/pagination';
import { PostsService } from '../posts/application/posts.service';
import { PostsRepository } from '../posts/infrastructure/posts.repository';
import { LikeStatusPostsRepository } from '../posts/infrastructure/like-status-posts.repository';
import { AuthService } from '../auth/application/auth.service';
import { BlacklistJwtRepository } from '../auth/infrastructure/blacklist-jwt.repository';
import { UsersService } from '../users/application/users.service';
import { UsersRepository } from '../users/infrastructure/users.repository';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [DatabaseModule, CaslModule, CqrsModule],
  controllers: [BlogsController],
  providers: [
    AuthService,
    BlacklistJwtRepository,
    UsersService,
    UsersRepository,
    BlogsService,
    BloggerBlogsService,
    BloggerBlogsRepository,
    ConvertFiltersForDB,
    BlogsRepository,
    Pagination,
    PostsService,
    PostsRepository,
    LikeStatusPostsRepository,
    ...blogsProviders,
  ],
})
export class BlogsModule {}

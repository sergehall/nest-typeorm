import { Module } from '@nestjs/common';
import { BlogsService } from './application/blogs.service';
import { BlogsController } from './api/blogs.controller';
import { BlogsRepository } from './infrastructure/blogs.repository';
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
import { UsersRawSqlRepository } from '../users/infrastructure/users-raw-sql.repository';
import { BloggerBlogsRawSqlRepository } from '../blogger-blogs/infrastructure/blogger-blogs-raw-sql.repository';
import { PostsRawSqlRepository } from '../posts/infrastructure/posts-raw-sql.repository';
import { LikeStatusPostsRawSqlRepository } from '../posts/infrastructure/like-status-posts-raw-sql.repository';
import { BlacklistJwtRawSqlRepository } from '../auth/infrastructure/blacklist-jwt-raw-sql.repository';
import { MongoDBModule } from '../../config/db/mongo/mongo-db.module';

@Module({
  imports: [MongoDBModule, CaslModule, CqrsModule],
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
    UsersRawSqlRepository,
    PostsService,
    PostsRepository,
    LikeStatusPostsRepository,
    BloggerBlogsRawSqlRepository,
    PostsRawSqlRepository,
    LikeStatusPostsRawSqlRepository,
    BlacklistJwtRawSqlRepository,
    ...blogsProviders,
  ],
})
export class BlogsModule {}

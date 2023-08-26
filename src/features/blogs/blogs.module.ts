import { Module } from '@nestjs/common';
import { BlogsService } from './application/blogs.service';
import { BlogsController } from './api/blogs.controller';
import { CaslModule } from '../../ability/casl.module';
import { BloggerBlogsService } from '../blogger-blogs/application/blogger-blogs.service';
import { PostsService } from '../posts/application/posts.service';
import { AuthService } from '../auth/application/auth.service';
import { UsersService } from '../users/application/users.service';
import { CqrsModule } from '@nestjs/cqrs';
import { UsersRawSqlRepository } from '../users/infrastructure/users-raw-sql.repository';
import { BloggerBlogsRawSqlRepository } from '../blogger-blogs/infrastructure/blogger-blogs-raw-sql.repository';
import { PostsRawSqlRepository } from '../posts/infrastructure/posts-raw-sql.repository';
import { LikeStatusPostsRawSqlRepository } from '../posts/infrastructure/like-status-posts-raw-sql.repository';
import { BlacklistJwtRawSqlRepository } from '../auth/infrastructure/blacklist-jwt-raw-sql.repository';
import { ParseQueriesService } from '../../common/query/parse-queries.service';
import { KeyResolver } from '../../common/helpers/key-resolver';
import { SearchBlogsUseCase } from './application/use-cases/search-blogs.use-case';
import { GetBlogByIdUseCase } from './application/use-cases/get-blog-by-id.use-case';
import { UsersRepo } from '../users/infrastructure/users-repo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from '../users/entities/users.entity';

const blogsUseCases = [SearchBlogsUseCase, GetBlogByIdUseCase];

@Module({
  imports: [TypeOrmModule.forFeature([UsersEntity]), CaslModule, CqrsModule],
  controllers: [BlogsController],
  providers: [
    AuthService,
    ParseQueriesService,
    UsersService,
    BlogsService,
    PostsService,
    KeyResolver,
    BloggerBlogsService,
    UsersRepo,
    UsersRawSqlRepository,
    BloggerBlogsRawSqlRepository,
    PostsRawSqlRepository,
    LikeStatusPostsRawSqlRepository,
    BlacklistJwtRawSqlRepository,
    ...blogsUseCases,
  ],
})
export class BlogsModule {}

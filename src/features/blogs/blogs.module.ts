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
import { ParseQueriesService } from '../../common/query/parse-queries.service';
import { KeyResolver } from '../../common/helpers/key-resolver';
import { SearchBlogsUseCase } from './application/use-cases/search-blogs.use-case';
import { GetBlogByIdUseCase } from './application/use-cases/get-blog-by-id.use-case';
import { UsersRepo } from '../users/infrastructure/users-repo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from '../users/entities/users.entity';
import { InvalidJwtRepo } from '../auth/infrastructure/invalid-jwt-repo';
import { InvalidJwtEntity } from '../auth/entities/invalid-jwt.entity';
import { BloggerBlogsRepo } from '../blogger-blogs/infrastructure/blogger-blogs.repo';
import { BloggerBlogsEntity } from '../blogger-blogs/entities/blogger-blogs.entity';
import { UuidErrorResolver } from '../../common/helpers/uuid-error-resolver';

const blogsUseCases = [SearchBlogsUseCase, GetBlogByIdUseCase];

const helpers = [KeyResolver, UuidErrorResolver];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsersEntity,
      InvalidJwtEntity,
      BloggerBlogsEntity,
    ]),
    CaslModule,
    CqrsModule,
  ],
  controllers: [BlogsController],
  providers: [
    AuthService,
    ParseQueriesService,
    UsersService,
    BlogsService,
    PostsService,
    BloggerBlogsService,
    UsersRepo,
    UsersRawSqlRepository,
    BloggerBlogsRepo,
    BloggerBlogsRawSqlRepository,
    PostsRawSqlRepository,
    InvalidJwtRepo,
    ...helpers,
    ...blogsUseCases,
  ],
})
export class BlogsModule {}

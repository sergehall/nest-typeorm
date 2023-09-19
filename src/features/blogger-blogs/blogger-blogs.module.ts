import { Module } from '@nestjs/common';
import { BloggerBlogsController } from './api/blogger-blogs.controller';
import { BloggerBlogsService } from './application/blogger-blogs.service';
import { PostsService } from '../posts/application/posts.service';
import { CaslAbilityFactory } from '../../ability/casl-ability.factory';
import { CreateBloggerBlogUseCase } from './application/use-cases/create-blogger-blog.use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { UpdateBlogByIdUseCase } from './application/use-cases/update-blog-byId.use-case';
import { BloggerBlogsRawSqlRepository } from './infrastructure/blogger-blogs-raw-sql.repository';
import { PostsRawSqlRepository } from '../posts/infrastructure/posts-raw-sql.repository';
import { UsersRawSqlRepository } from '../users/infrastructure/users-raw-sql.repository';
import { BannedUsersForBlogsRawSqlRepository } from '../users/infrastructure/banned-users-for-blogs-raw-sql.repository';
import { ParseQueriesService } from '../../common/query/parse-queries.service';
import { KeyResolver } from '../../common/helpers/key-resolver';
import { SearchBannedUsersInBlogUseCase } from './application/use-cases/search-banned-users-in-blog.use.case';
import { ManageBlogAccessUseCase } from './application/use-cases/manage-blog-access.use-case';
import { GetBlogsOwnedByCurrentUserUseCase } from './application/use-cases/get-blogs-owned-by-current-user.use-case';
import { DeleteBlogByBlogIdUseCase } from './application/use-cases/delete-blog-by-blog-id.use-case';
import { BloggerBlogsRepo } from './infrastructure/blogger-blogs.repo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BloggerBlogsEntity } from './entities/blogger-blogs.entity';
import { PostsRepo } from '../posts/infrastructure/posts-repo';
import { PostsEntity } from '../posts/entities/posts.entity';
import { LikeStatusPostsEntity } from '../posts/entities/like-status-posts.entity';
import { CommentsEntity } from '../comments/entities/comments.entity';
import { BlogExistsValidator } from '../../common/validators/blog-exists.validator';

const bloggersBlogUseCases = [
  GetBlogsOwnedByCurrentUserUseCase,
  SearchBannedUsersInBlogUseCase,
  ManageBlogAccessUseCase,
  CreateBloggerBlogUseCase,
  UpdateBlogByIdUseCase,
  DeleteBlogByBlogIdUseCase,
];

const validators = [BlogExistsValidator];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PostsEntity,
      CommentsEntity,
      BloggerBlogsEntity,
      LikeStatusPostsEntity,
    ]),
    CqrsModule,
  ],
  controllers: [BloggerBlogsController],
  providers: [
    CaslAbilityFactory,
    ParseQueriesService,
    BloggerBlogsService,
    PostsService,
    KeyResolver,
    UsersRawSqlRepository,
    BloggerBlogsRepo,
    BloggerBlogsRawSqlRepository,
    PostsRepo,
    PostsRawSqlRepository,
    BannedUsersForBlogsRawSqlRepository,
    ...bloggersBlogUseCases,
    ...validators,
  ],
})
export class BloggerBlogsModule {}

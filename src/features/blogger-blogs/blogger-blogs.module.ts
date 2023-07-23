import { Module } from '@nestjs/common';
import { bloggerBlogsProviders } from './infrastructure/blogger-blogs.providers';
import { BloggerBlogsController } from './api/blogger-blogs.controller';
import { BloggerBlogsService } from './application/blogger-blogs.service';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { PostsService } from '../posts/application/posts.service';
import { Pagination } from '../common/pagination/pagination';
import { PostsRepository } from '../posts/infrastructure/posts.repository';
import { CaslAbilityFactory } from '../../ability/casl-ability.factory';
import { LikeStatusPostsRepository } from '../posts/infrastructure/like-status-posts.repository';
import { ConvertFiltersForDB } from '../common/convert-filters/convertFiltersForDB';
import { BloggerBlogsRepository } from './infrastructure/blogger-blogs.repository';
import { CreateBloggerBlogUseCase } from './application/use-cases/create-blogger-blog.use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { UpdateBlogByIdUseCase } from './application/use-cases/update-blog-byId.use-case';
import { RemoveBlogByIdUseCase } from './application/use-cases/remove-blog-byId.use-case';
import { FindCommentsCurrentUserUseCase } from './application/use-cases/find-comments-current-user.use-case';
import { BanUserForBlogUseCase } from './application/use-cases/ban-user-for-blog.use-case';
import { UsersRepository } from '../users/infrastructure/users.repository';
import { AddBannedUserToBanListUseCase } from './application/use-cases/add-banned-user-to-ban-list.use-case';
import { ChangeBanStatusOwnerBlogUseCase } from './application/use-cases/change-ban-status-owner-blog.use-case';
import { CommentsRepository } from '../comments/infrastructure/comments.repository';
import { BloggerBlogsRawSqlRepository } from './infrastructure/blogger-blogs-raw-sql.repository';
import { CommentsRawSqlRepository } from '../comments/infrastructure/comments-raw-sql.repository';
import { PostsRawSqlRepository } from '../posts/infrastructure/posts-raw-sql.repository';
import { LikeStatusPostsRawSqlRepository } from '../posts/infrastructure/like-status-posts-raw-sql.repository';
import { BlogExistsRule } from '../../pipes/blog-exist-rule.validation';
import { UsersRawSqlRepository } from '../users/infrastructure/users-raw-sql.repository';
import { BannedUsersForBlogsRawSqlRepository } from './infrastructure/banned-users-for-blogs-raw-sql.repository';
import { FindAllBannedUsersForBlogUseCase } from './application/use-cases/find-all-banned-users-for-blog.use.case';
import { ChangeBanStatusBlogsByBlogIdUseCase } from '../sa/application/use-cases/change-banStatus-blogs-byBlogId.use-case';

const bloggersBlogUseCases = [
  CreateBloggerBlogUseCase,
  UpdateBlogByIdUseCase,
  RemoveBlogByIdUseCase,
  FindCommentsCurrentUserUseCase,
  BanUserForBlogUseCase,
  AddBannedUserToBanListUseCase,
  ChangeBanStatusOwnerBlogUseCase,
  FindAllBannedUsersForBlogUseCase,
  ChangeBanStatusBlogsByBlogIdUseCase,
];
const bloggersBlogRules = [BlogExistsRule];

@Module({
  imports: [DatabaseModule, CqrsModule],
  controllers: [BloggerBlogsController],
  providers: [
    BloggerBlogsService,
    UsersRepository,
    BloggerBlogsRepository,
    PostsService,
    Pagination,
    PostsRepository,
    CaslAbilityFactory,
    LikeStatusPostsRepository,
    ConvertFiltersForDB,
    CommentsRepository,
    UsersRawSqlRepository,
    BloggerBlogsRawSqlRepository,
    CommentsRawSqlRepository,
    PostsRawSqlRepository,
    LikeStatusPostsRawSqlRepository,
    BannedUsersForBlogsRawSqlRepository,
    ...bloggersBlogRules,
    ...bloggersBlogUseCases,
    ...bloggerBlogsProviders,
  ],
})
export class BloggerBlogsModule {}

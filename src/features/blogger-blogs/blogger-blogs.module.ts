import { Module } from '@nestjs/common';
import { BloggerBlogsController } from './api/blogger-blogs.controller';
import { BloggerBlogsService } from './application/blogger-blogs.service';
import { PostsService } from '../posts/application/posts.service';
import { CaslAbilityFactory } from '../../ability/casl-ability.factory';
import { CreateBloggerBlogUseCase } from './application/use-cases/create-blogger-blog.use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { UpdateBlogByIdUseCase } from './application/use-cases/update-blog-byId.use-case';
import { RemoveBlogByIdUseCase } from './application/use-cases/remove-blog-byId.use-case';
import { FindCommentsCurrentUserUseCase } from './application/use-cases/find-comments-current-user.use-case';
import { BanUserForBlogUseCase } from './application/use-cases/ban-user-for-blog.use-case';
import { AddBannedUserToBanListUseCase } from './application/use-cases/add-banned-user-to-ban-list.use-case';
import { ChangeBanStatusOwnerBlogUseCase } from './application/use-cases/change-ban-status-owner-blog.use-case';
import { BloggerBlogsRawSqlRepository } from './infrastructure/blogger-blogs-raw-sql.repository';
import { CommentsRawSqlRepository } from '../comments/infrastructure/comments-raw-sql.repository';
import { PostsRawSqlRepository } from '../posts/infrastructure/posts-raw-sql.repository';
import { LikeStatusPostsRawSqlRepository } from '../posts/infrastructure/like-status-posts-raw-sql.repository';
import { BlogExistsRule } from '../../pipes/blog-exist-rule.validation';
import { UsersRawSqlRepository } from '../users/infrastructure/users-raw-sql.repository';
import { BannedUsersForBlogsRawSqlRepository } from '../users/infrastructure/banned-users-for-blogs-raw-sql.repository';
import { FindAllBannedUsersForBlogUseCase } from './application/use-cases/find-all-banned-users-for-blog.use.case';
import { SaChangeBanstatusBlogsByBlogIdUseCase } from '../sa/application/use-cases/sa-change-banstatus-blogs-by-blog-id.use-case';
import { LikeStatusCommentsRawSqlRepository } from '../comments/infrastructure/like-status-comments-raw-sql.repository';
import { ChangeBanStatusLikesPostForBannedUserUseCase } from '../posts/application/use-cases/change-banstatus-posts-by-userid-blogid.use-case';
import { ParseQueriesService } from '../common/query/parse-queries.service';
import { KeyArrayProcessor } from '../common/query/get-key-from-array-or-default';

const bloggersBlogUseCases = [
  CreateBloggerBlogUseCase,
  UpdateBlogByIdUseCase,
  RemoveBlogByIdUseCase,
  FindCommentsCurrentUserUseCase,
  BanUserForBlogUseCase,
  AddBannedUserToBanListUseCase,
  ChangeBanStatusOwnerBlogUseCase,
  FindAllBannedUsersForBlogUseCase,
  SaChangeBanstatusBlogsByBlogIdUseCase,
  ChangeBanStatusLikesPostForBannedUserUseCase,
];
const bloggersBlogRules = [BlogExistsRule];

@Module({
  imports: [CqrsModule],
  controllers: [BloggerBlogsController],
  providers: [
    CaslAbilityFactory,
    ParseQueriesService,
    BloggerBlogsService,
    PostsService,
    UsersRawSqlRepository,
    BloggerBlogsRawSqlRepository,
    CommentsRawSqlRepository,
    PostsRawSqlRepository,
    KeyArrayProcessor,
    LikeStatusPostsRawSqlRepository,
    LikeStatusCommentsRawSqlRepository,
    BannedUsersForBlogsRawSqlRepository,
    ...bloggersBlogRules,
    ...bloggersBlogUseCases,
  ],
})
export class BloggerBlogsModule {}

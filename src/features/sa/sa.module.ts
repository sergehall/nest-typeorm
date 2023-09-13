import { Module } from '@nestjs/common';
import { UsersService } from '../users/application/users.service';
import { CaslModule } from '../../ability/casl.module';
import { BloggerBlogsService } from '../blogger-blogs/application/blogger-blogs.service';
import { SaController } from './api/sa.controller';
import { SaService } from './application/sa.service';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateUserUseCase } from '../users/application/use-cases/create-user.use-case';
import { UsersRawSqlRepository } from '../users/infrastructure/users-raw-sql.repository';
import { BloggerBlogsRawSqlRepository } from '../blogger-blogs/infrastructure/blogger-blogs-raw-sql.repository';
import { SaDeleteUserByUserIdUseCase } from './application/use-cases/sa-delete-user-by-user-id.use-case';
import { CommentsRawSqlRepository } from '../comments/infrastructure/comments-raw-sql.repository';
import { PostsRawSqlRepository } from '../posts/infrastructure/posts-raw-sql.repository';
import { SecurityDevicesRawSqlRepository } from '../security-devices/infrastructure/security-devices-raw-sql.repository';
import { BannedUsersForBlogsRawSqlRepository } from '../users/infrastructure/banned-users-for-blogs-raw-sql.repository';
import { ExpirationDateCalculator } from '../../common/helpers/expiration-date-calculator';
import { EncryptConfig } from '../../config/encrypt/encrypt-config';
import { ParseQueriesService } from '../../common/query/parse-queries.service';
import { SaBanUnbanUserUseCase } from './application/use-cases/sa-ban-unban-user.use-case';
import { SaBindBlogWithUserUseCase } from './application/use-cases/sa-bind-blog-with-user.use-case';
import { SaBindBlogWithUserByIdUseCase } from './application/use-cases/sa-bind-blog-with-user-by-id.use-case';
import { SaBanUnbanBlogUseCase } from './application/use-cases/sa-ban-unban-blog-for-user.use-case';
import { SentCodeLogRepository } from '../../mails/infrastructure/sent-code-log.repository';
import { KeyResolver } from '../../common/helpers/key-resolver';
import { UsersRepo } from '../users/infrastructure/users-repo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from '../users/entities/users.entity';
import { SaFindUsersUseCase } from './application/use-cases/sa-find-users.use-case';
import { SaFindBlogsCommand } from './application/use-cases/sa-find-blogs.use-case';
import { SaChangeRoleUseCase } from './application/use-cases/sa-change-role.use-case';
import { SaCreateBlogUseCase } from './application/use-cases/sa-create-blog.use-case';
import { BloggerBlogsRepo } from '../blogger-blogs/infrastructure/blogger-blogs.repo';
import { BloggerBlogsEntity } from '../blogger-blogs/entities/blogger-blogs.entity';
import { SaCreateSuperAdmin } from './application/use-cases/sa-create-super-admin.use-case';
import { SaUpdateBlogByIdUseCase } from './application/use-cases/sa-update-blog-by-id.use-case';
import { SaDeleteBlogByBlogIdUseCase } from './application/use-cases/sa-delete-blog-by-id.use-case';
import { SaUpdatePostsByPostIdUseCase } from './application/use-cases/sa-update-post.use-case';
import { PostsRepo } from '../posts/infrastructure/posts-repo';
import { PostsEntity } from '../posts/entities/posts.entity';
import { LikeStatusPostsEntity } from '../posts/entities/like-status-posts.entity';
import { CommentsEntity } from '../comments/entities/comments.entity';
import { SaDeletePostByPostIdUseCase } from './application/use-cases/sa-delete-post-by-post-id.use-case';

const saUseCases = [
  SaFindBlogsCommand,
  SaFindUsersUseCase,
  CreateUserUseCase,
  SaChangeRoleUseCase,
  SaDeleteUserByUserIdUseCase,
  SaBanUnbanBlogUseCase,
  SaBanUnbanUserUseCase,
  SaBindBlogWithUserByIdUseCase,
  SaBindBlogWithUserUseCase,
  SaCreateBlogUseCase,
  SaUpdateBlogByIdUseCase,
  SaDeleteBlogByBlogIdUseCase,
  SaUpdatePostsByPostIdUseCase,
  SaDeletePostByPostIdUseCase,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsersEntity,
      BloggerBlogsEntity,
      PostsEntity,
      LikeStatusPostsEntity,
      CommentsEntity,
    ]),
    CaslModule,
    CqrsModule,
  ],
  controllers: [SaController],
  providers: [
    SaCreateSuperAdmin,
    ParseQueriesService,
    SaService,
    UsersService,
    BloggerBlogsService,
    EncryptConfig,
    KeyResolver,
    UsersRepo,
    SentCodeLogRepository,
    PostsRepo,
    PostsRawSqlRepository,
    UsersRawSqlRepository,
    ExpirationDateCalculator,
    CommentsRawSqlRepository,
    BloggerBlogsRepo,
    BloggerBlogsRawSqlRepository,
    SecurityDevicesRawSqlRepository,
    BannedUsersForBlogsRawSqlRepository,
    ...saUseCases,
  ],
})
export class SaModule {}

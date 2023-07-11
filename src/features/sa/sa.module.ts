import { Module } from '@nestjs/common';
import { UsersService } from '../users/application/users.service';
import { ConvertFiltersForDB } from '../common/convert-filters/convertFiltersForDB';
import { Pagination } from '../common/pagination/pagination';
import { UsersRepository } from '../users/infrastructure/users.repository';
import { MailsRepository } from '../mails/infrastructure/mails.repository';
import { saProviders } from './infrastructure/sa.providers';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { CaslModule } from '../../ability/casl.module';
import { BloggerBlogsService } from '../blogger-blogs/application/blogger-blogs.service';
import { PostsRepository } from '../posts/infrastructure/posts.repository';
import { LikeStatusPostsRepository } from '../posts/infrastructure/like-status-posts.repository';
import { SaController } from './api/sa.controller';
import { SaService } from './application/sa.service';
import { LikeStatusCommentsRepository } from '../comments/infrastructure/like-status-comments.repository';
import { BloggerBlogsRepository } from '../blogger-blogs/infrastructure/blogger-blogs.repository';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateUserByInstanceUseCase } from '../users/application/use-cases/create-user-byInstance.use-case';
import { ChangeRoleUseCase } from './application/use-cases/change-role.use-case';
import { SaBanUserUseCase } from './application/use-cases/sa-ban-user.use-case';
import { SaBanBlogUseCase } from './application/use-cases/sa-ban-blog.use-case';
import { UsersRawSqlRepository } from '../users/infrastructure/users-raw-sql.repository';
import { BloggerBlogsRawSqlRepository } from '../blogger-blogs/infrastructure/blogger-blogs-raw-sql.repository';

const saUseCases = [
  CreateUserByInstanceUseCase,
  ChangeRoleUseCase,
  SaBanUserUseCase,
  SaBanBlogUseCase,
];

@Module({
  imports: [DatabaseModule, CaslModule, CqrsModule],
  controllers: [SaController],
  providers: [
    SaService,
    UsersService,
    BloggerBlogsService,
    ConvertFiltersForDB,
    BloggerBlogsRepository,
    Pagination,
    UsersRepository,
    MailsRepository,
    PostsRepository,
    UsersRawSqlRepository,
    LikeStatusPostsRepository,
    LikeStatusCommentsRepository,
    BloggerBlogsRawSqlRepository,
    ...saUseCases,
    ...saProviders,
  ],
})
export class SaModule {}

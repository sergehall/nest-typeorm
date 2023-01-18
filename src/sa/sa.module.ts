import { Module } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { ConvertFiltersForDB } from '../infrastructure/common/convert-filters/convertFiltersForDB';
import { Pagination } from '../infrastructure/common/pagination/pagination';
import { UsersRepository } from '../users/infrastructure/users.repository';
import { MailsRepository } from '../mails/infrastructure/mails.repository';
import { saProviders } from './infrastructure/sa.providers';
import { DatabaseModule } from '../infrastructure/database/database.module';
import { CaslModule } from '../ability/casl.module';
import { BlogsService } from '../blogger/blogs.service';
import { BlogsRepository } from '../blogger/infrastructure/blogs.repository';
import { PostsService } from '../posts/posts.service';
import { PostsRepository } from '../posts/infrastructure/posts.repository';
import { LikeStatusPostsRepository } from '../posts/infrastructure/like-status-posts.repository';
import { SaController } from './sa.controller';
import { SaService } from './sa.service';
import { SecurityDevicesService } from '../security-devices/security-devices.service';
import { SecurityDevicesRepository } from '../security-devices/infrastructure/security-devices.repository';
import { CommentsService } from '../comments/comments.service';
import { CommentsRepository } from '../comments/infrastructure/comments.repository';
import { LikeStatusCommentsRepository } from '../comments/infrastructure/like-status-comments.repository';

@Module({
  imports: [DatabaseModule, CaslModule],
  controllers: [SaController],
  providers: [
    SaService,
    UsersService,
    BlogsService,
    SecurityDevicesService,
    SecurityDevicesRepository,
    ConvertFiltersForDB,
    PostsService,
    BlogsRepository,
    Pagination,
    UsersRepository,
    MailsRepository,
    PostsRepository,
    LikeStatusPostsRepository,
    CommentsService,
    CommentsRepository,
    LikeStatusCommentsRepository,
    ...saProviders,
  ],
})
export class SaModule {}
